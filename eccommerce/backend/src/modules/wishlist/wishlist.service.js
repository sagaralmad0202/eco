const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const { toMoneyString } = require("../../utils/money");
const publicMediaUrl = require("../../utils/publicMediaUrl");

// A wishlist saves PRODUCTS, not variants. Someone hearting a jacket is
// saying "I want this jacket", not "I want the blue one in medium" — the size
// is chosen later, on the product page, when they actually buy.
//
// Every query filters on userId as part of the WHERE clause rather than
// checking ownership after a lookup by id, same rule as carts and addresses.

// Enough to render a product card and nothing more. The wishlist page shows a
// grid, not full product detail.
const productSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  image: true,
  isActive: true,
  images: { orderBy: { position: "asc" }, take: 1 },
  variants: {
    where: { isActive: true },
    orderBy: { price: "asc" },
    select: { price: true, compareAtPrice: true, stock: true },
  },
};

function serialiseEntry(entry) {
  const { product } = entry;
  const cheapest = product.variants[0];

  return {
    id: entry.id,
    addedAt: entry.createdAt,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      image: publicMediaUrl(product.image ?? product.images[0]?.url ?? null),
      // Money as a fixed-2 string, never a number — see utils/money.js.
      priceFrom: cheapest ? toMoneyString(cheapest.price) : null,
      compareAtPrice: cheapest?.compareAtPrice
        ? toMoneyString(cheapest.compareAtPrice)
        : null,
      inStock: product.variants.some((variant) => variant.stock > 0),
      // A product delisted after it was saved stays in the list, greyed out.
      // Deleting the row on the customer's behalf would make items vanish
      // with no explanation.
      available: product.isActive,
    },
  };
}

async function listWishlist(userId) {
  const entries = await prisma.wishlist.findMany({
    where: { userId },
    // Most recently saved first — the thing they just hearted should be at
    // the top when they open the page.
    orderBy: { createdAt: "desc" },
    include: { product: { select: productSelect } },
  });

  return entries.map(serialiseEntry);
}

async function addItem(userId, { productId }) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true },
  });

  if (!product || !product.isActive) {
    throw ApiError.notFound("Product not found");
  }

  // Saving something already saved is not an error worth surfacing — the
  // heart is a toggle and a double-tap should leave it filled, not 409.
  // The unique constraint on [userId, productId] makes this safe against two
  // requests racing.
  await prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });

  return listWishlist(userId);
}

// Keyed by productId rather than the row id: the frontend has the product to
// hand when the heart is clicked, and would otherwise need a lookup just to
// find the id of a row it is about to delete.
async function removeItem(userId, productId) {
  const result = await prisma.wishlist.deleteMany({
    where: { userId, productId },
  });

  // deleteMany over delete on purpose: it accepts a non-unique filter, so
  // userId can live in the WHERE clause. delete would need the row id, which
  // means fetching first and checking ownership afterwards.
  if (result.count === 0) {
    throw ApiError.notFound("That product is not in your wishlist");
  }

  return listWishlist(userId);
}

async function clearWishlist(userId) {
  const result = await prisma.wishlist.deleteMany({ where: { userId } });
  return result.count;
}

/**
 * Flips a product in or out of the wishlist and reports which happened.
 *
 * The home page and listing cards only have one control — a heart — and no
 * reliable idea of the current state on first render. Making them call add or
 * remove based on a guess produces "already saved" errors on a stale page;
 * one idempotent endpoint does not.
 */
async function toggleItem(userId, { productId }) {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return { saved: false, items: await listWishlist(userId) };
  }

  await addItem(userId, { productId });
  return { saved: true, items: await listWishlist(userId) };
}

module.exports = {
  listWishlist,
  addItem,
  removeItem,
  toggleItem,
  clearWishlist,
};
