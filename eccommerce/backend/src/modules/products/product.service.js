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
  const { page, limit, search, category, brand, minPrice, maxPrice, sort, inStock } =
    query;

  const where = { isActive: true };

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
        images: { orderBy: { position: "asc" }, take: 1 },
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

async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
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

async function listCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { name: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

module.exports = { listProducts, getProductBySlug, listCategories };
