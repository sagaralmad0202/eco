const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

// Prisma returns Decimal objects for money columns. JSON.stringify turns
// those into something the frontend cannot use directly, so convert to a
// plain string at the boundary. String, not Number — parsing "2999.00" into
// a float is exactly the rounding bug the Decimal column exists to prevent.
function serialiseVariant(v) {
  return {
    ...v,
    price: v.price.toString(),
    compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : null,
    inStock: v.stock > 0,
  };
}

function serialiseProduct(p) {
  const variants = (p.variants ?? []).map(serialiseVariant);

  // Cheapest active variant drives the "from ₹X" label on listing cards.
  const prices = variants.map((v) => Number(v.price));

  return {
    ...p,
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
    brand,
    minPrice,
    maxPrice,
    sort,
    inStock,
    featured,
  } = query;

  const where = { isActive: true };

  // Only narrow when featured=true was asked for. An absent flag means
  // "all products", not "the unfeatured ones" — ?featured=false would
  // otherwise be the only way to see the normal catalogue.
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

  if (category) {
    where.category = { slug: category };
  }

  if (brand) {
    where.brand = { equals: brand, mode: "insensitive" };
  }

  // Price and stock live on variants, so filter through the relation:
  // "products having at least one variant that matches".
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

  if (hasVariantFilter) {
    where.variants = { some: variantFilter };
  }

  const orderBy = {
    newest: { createdAt: "desc" },
    name_asc: { name: "asc" },
    // Sorting by a relation's price needs a raw query to do properly.
    // Falling back to newest here and sorting in-page below.
    price_asc: { createdAt: "desc" },
    price_desc: { createdAt: "desc" },
  }[sort];

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
        : Number(b.priceFrom) - Number(a.priceFrom)
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
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slugOrId);
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
      average: ratings._avg.rating ? Number(ratings._avg.rating.toFixed(2)) : null,
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
    counts.map((row) => [row.categoryId, row._count._all])
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
  const { name, slug, description, brand, isFeatured, categoryId, variants = [], images = [] } = data;

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
          position: typeof img === "object" && img.position !== undefined ? img.position : idx,
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

module.exports = { listProducts, getProductBySlug, listCategories, createProduct };
