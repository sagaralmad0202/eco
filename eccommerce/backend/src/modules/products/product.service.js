const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const publicMediaUrl = require("../../utils/publicMediaUrl");
const { toMoneyString } = require("../../utils/money");

// Prisma returns Decimal objects for money columns. Convert to a fixed
// two-decimal string at the boundary using toMoneyString.
function serialiseVariant(v) {
  return {
    ...v,
    price: toMoneyString(v.price),
    compareAtPrice: v.compareAtPrice ? toMoneyString(v.compareAtPrice) : null,
    inStock: v.stock > 0,
  };
}

function serialiseProduct(p) {
  const variants = (p.variants ?? []).map(serialiseVariant);
  const images = (p.images ?? []).map((image) => ({
    ...image,
    url: publicMediaUrl(image.url),
  }));

  // Cheapest active variant drives the "from ₹X" label on listing cards.
  const prices = variants.map((v) => Number(v.price));

  return {
    ...p,
    image: publicMediaUrl(p.image),
    images,
    variants,
    priceFrom: prices.length ? Math.min(...prices).toFixed(2) : null,
    inStock: variants.some((v) => v.inStock),
  };
}

async function listProducts(query) {
  const {
    page,
    limit,
    search,
    category,
    categories,
    brand,
    color,
    colors,
    size,
    sizes,
    minPrice,
    maxPrice,
    sort,
    inStock,
    featured,
  } = query;

  const where = { isActive: true };

  // Only narrow when featured=true was asked for.
  if (featured) {
    where.isFeatured = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  // Handle category or multiple categories
  const catInput = categories || category;
  if (catInput) {
    const rawList = Array.isArray(catInput)
      ? catInput
      : catInput.split(",").map((c) => c.trim().toLowerCase());

    // "new arrivals" / "new-arrivals" is a virtual filter, not a real category.
    // It maps to isFeatured, which is what the home page's curated rail uses.
    if (rawList.includes("new arrivals") || rawList.includes("new-arrivals")) {
      where.isFeatured = true;
    }

    // Filter out virtual categories and the "all" catch-all.
    const validSlugs = rawList.filter(
      (c) => c && c !== "all" && c !== "new arrivals" && c !== "new-arrivals",
    );

    if (validSlugs.length > 0) {
      const catCondition = { category: { slug: { in: validSlugs } } };
      if (where.OR) {
        where.AND = [{ OR: where.OR }, catCondition];
        delete where.OR;
      } else {
        Object.assign(where, catCondition);
      }
    }
  }

  if (brand) {
    where.brand = { equals: brand, mode: "insensitive" };
  }

  // Price, stock, color, and size live on variants
  const variantFilter = { isActive: true };
  let hasVariantFilter = false;

  if (minPrice !== undefined || maxPrice !== undefined) {
    variantFilter.price = {};
    if (minPrice !== undefined) variantFilter.price.gte = minPrice;
    if (maxPrice !== undefined) variantFilter.price.lte = maxPrice;
    hasVariantFilter = true;
  }

  if (inStock) {
    variantFilter.stock = { gt: 0 };
    hasVariantFilter = true;
  }

  // Colors filter
  const colorInput = colors || color;
  if (colorInput) {
    const colorList = Array.isArray(colorInput)
      ? colorInput
      : colorInput
          .split(",")
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean);
    if (colorList.length > 0) {
      variantFilter.OR = colorList.map((c) => ({
        title: { contains: c, mode: "insensitive" },
      }));
      hasVariantFilter = true;
    }
  }

  // Sizes filter
  const sizeInput = sizes || size;
  if (sizeInput) {
    const sizeList = Array.isArray(sizeInput)
      ? sizeInput
      : sizeInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    if (sizeList.length > 0) {
      const sizeConditions = sizeList.map((s) => ({
        title: { contains: s, mode: "insensitive" },
      }));
      if (variantFilter.OR) {
        variantFilter.AND = [{ OR: variantFilter.OR }, { OR: sizeConditions }];
        delete variantFilter.OR;
      } else {
        variantFilter.OR = sizeConditions;
      }
      hasVariantFilter = true;
    }
  }

  if (hasVariantFilter) {
    where.variants = { some: variantFilter };
  }

  const orderBy = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
    price_asc: { createdAt: "desc" },
    price_desc: { createdAt: "desc" },
  }[sort] || { createdAt: "desc" };

  // Run both queries at once rather than sequentially — halves the latency,
  // which matters on a free tier that may be waking from sleep.
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  let items = products.map(serialiseProduct);

  if (sort === "price_asc" || sort === "price_desc") {
    items.sort((a, b) =>
      sort === "price_asc"
        ? Number(a.priceFrom) - Number(b.priceFrom)
        : Number(b.priceFrom) - Number(a.priceFrom),
    );
  }

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

async function getProductBySlug(slugOrId) {
  const isUuid =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      slugOrId,
    );
  const where = isUuid ? { id: slugOrId } : { slug: slugOrId };

  const product = await prisma.product.findUnique({
    where,
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          user: { select: { fullName: true } },
        },
      },
    },
  });

  // Treat inactive products as missing. Revealing "this exists but is
  // disabled" tells competitors what you have delisted.
  if (!product || !product.isActive) {
    throw ApiError.notFound("Product not found");
  }

  const ratings = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    ...serialiseProduct(product),
    rating: {
      average: ratings._avg.rating
        ? Number(ratings._avg.rating.toFixed(2))
        : null,
      count: ratings._count.rating,
    },
  };
}

// The home page's category tiles show "48 items" under each name, so the
// count ships with the list rather than forcing the frontend into one extra
// request per tile.
//
// Prisma's _count cannot be filtered by isActive, and counting deactivated
// products would advertise more than the catalogue actually shows. So the
// counts come from a single groupBy over active products and are stitched on
// in memory — two queries total regardless of how many categories exist.
async function listCategories() {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { name: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { isActive: true, categoryId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countByCategory = new Map(
    counts.map((row) => [row.categoryId, row._count._all]),
  );

  const countFor = (id) => countByCategory.get(id) ?? 0;

  return categories.map((category) => {
    const children = category.children.map((child) => ({
      ...child,
      productCount: countFor(child.id),
    }));

    return {
      ...category,
      children,
      // A parent's count includes its children's. Products are usually filed
      // under the leaf ("Sneakers"), so a parent tile reading 0 while its
      productCount:
        countFor(category.id) +
        children.reduce((sum, child) => sum + child.productCount, 0),
    };
  });
}

async function createProduct(data) {
  const {
    name,
    slug,
    description,
    brand,
    isFeatured,
    categoryId,
    variants = [],
    images = [],
  } = data;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      brand: brand || "Eco",
      isFeatured: isFeatured ?? false,
      ...(categoryId ? { categoryId } : {}),
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
          title: v.title,
          price: v.price,
          compareAtPrice: v.compareAtPrice || null,
          stock: v.stock ?? 10,
        })),
      },
      images: {
        create: images.map((img, idx) => ({
          url: typeof img === "string" ? img : img.url,
          alt: typeof img === "string" ? name : img.alt || name,
          position:
            typeof img === "object" && img.position !== undefined
              ? img.position
              : idx,
        })),
      },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
      images: { orderBy: { position: "asc" } },
    },
  });

  return serialiseProduct(product);
}

module.exports = {
  listProducts,
  getProductBySlug,
  listCategories,
  createProduct,
};
