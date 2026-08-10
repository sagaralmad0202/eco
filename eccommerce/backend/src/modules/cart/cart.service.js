const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const { toMoneyString, multiply, sum } = require("../../utils/money");

// A cart belongs to EITHER a signed-in user or an anonymous session, never
// both — the schema enforces that with two separate unique columns. Every
// function here takes the same { userId, sessionId } owner object so the
// guest and member paths cannot drift apart.
//
// userId wins when both are present: a customer who signs in mid-visit should
// land on their real cart, not the throwaway one their browser was carrying.
function ownerWhere({ userId, sessionId }) {
  if (userId) return { userId };
  if (sessionId) return { sessionId };

  // Neither means the request arrived with no session cookie and no token.
  // That is a client bug, not a customer with an empty cart, so say so rather
  // than quietly handing back an empty array that hides the mistake.
  throw ApiError.badRequest("No cart session. Send a session id or sign in.");
}

// The shape every cart endpoint returns. Kept in one place because the
// frontend badge, the drawer and the checkout summary all read it, and a
// PATCH that returned a differently-shaped cart than GET would break them.
const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              brand: true,
              isActive: true,
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  },
};

// Prices are read fresh on every request and never stored on the cart item.
// If a price changed since the item was added, the customer sees the new one
// here — the amount is only frozen when the order is placed.
function serialiseItem(item) {
  const { variant } = item;
  const lineTotal = multiply(variant.price, item.quantity);

  return {
    id: item.id,
    quantity: item.quantity,
    variant: {
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      price: toMoneyString(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? toMoneyString(variant.compareAtPrice)
        : null,
      stock: variant.stock,
      inStock: variant.stock > 0,
    },
    product: {
      id: variant.product.id,
      name: variant.product.name,
      slug: variant.product.slug,
      brand: variant.product.brand,
      image: variant.product.images[0]?.url ?? null,
    },
    lineTotal: toMoneyString(lineTotal),
    // Flagged rather than hidden. Silently dropping a line the customer put
    // there is confusing; the drawer can grey it out and block checkout while
    // still showing what happened.
    unavailable:
      !variant.isActive || !variant.product.isActive || variant.stock === 0,
    // The customer asked for more than is left. Checkout will need to clamp,
    // and the drawer should warn before they get that far.
    exceedsStock: item.quantity > variant.stock,
  };
}

function serialiseCart(cart) {
  const items = (cart?.items ?? []).map(serialiseItem);
  const sellable = items.filter((item) => !item.unavailable);

  return {
    id: cart?.id ?? null,
    items,
    // Counts units, not lines: a badge reading "1" for three of the same
    // t-shirt looks wrong to a customer who added three.
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    // Unavailable lines are excluded so the total matches what would
    // actually be charged.
    subtotal: toMoneyString(sum(sellable.map((item) => item.lineTotal))),
    // Shipping, tax and discounts are decided at checkout, not here. A cart
    // that guessed at them would disagree with the order it becomes.
  };
}

async function getCart(owner) {
  const cart = await prisma.cart.findFirst({
    where: ownerWhere(owner),
    include: cartInclude,
  });

  // No row yet is the normal state for a first-time visitor. Returning an
  // empty cart rather than creating one keeps GET side-effect free — and
  // stops every crawler that hits the homepage from leaving a row behind.
  return serialiseCart(cart);
}

// Created lazily, on first add rather than on first look.
//
// The find-then-create is not atomic, so two adds firing at once can both find
// nothing and both try to create. userId and sessionId are unique, so the
// loser gets P2002 rather than a duplicate cart — at which point the winner's
// row exists and re-reading it is the right answer. Letting that bubble up
// would fail an add for no reason the customer could understand.
async function getOrCreateCart(owner) {
  const where = ownerWhere(owner);

  const existing = await prisma.cart.findFirst({ where });
  if (existing) return existing;

  try {
    return await prisma.cart.create({ data: where });
  } catch (err) {
    if (err.code !== "P2002") throw err;
    return prisma.cart.findFirstOrThrow({ where });
  }
}

async function addItem(owner, { variantId, quantity }) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { isActive: true } } },
  });

  // Same reasoning as getProductBySlug: an inactive variant is treated as
  // missing, because "this exists but is disabled" is not the caller's
  // business.
  if (!variant || !variant.isActive || !variant.product.isActive) {
    throw ApiError.notFound("Product not found");
  }

  if (variant.stock === 0) {
    throw ApiError.badRequest("This item is out of stock");
  }

  const cart = await getOrCreateCart(owner);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  // Adding the same variant again means "make it more", not "list it twice".
  const nextQuantity = (existing?.quantity ?? 0) + quantity;

  // Checked against the total, not the increment. Otherwise ten separate
  // "add 1" calls would walk past the stock the increment check was
  // protecting.
  if (nextQuantity > variant.stock) {
    throw ApiError.badRequest(
      `Only ${variant.stock} left in stock`
    );
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, quantity: nextQuantity },
    update: { quantity: nextQuantity },
  });

  return getCart(owner);
}

// Ownership is part of the WHERE clause rather than an if-statement after a
// lookup by id, for the same reason as the address module: it is how one
// customer ends up editing another's cart by guessing a uuid.
async function findOwnedItem(owner, itemId) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: ownerWhere(owner) },
    include: { variant: { select: { stock: true } } },
  });

  if (!item) throw ApiError.notFound("Cart item not found");

  return item;
}

async function updateItem(owner, itemId, { quantity }) {
  const item = await findOwnedItem(owner, itemId);

  if (quantity > item.variant.stock) {
    throw ApiError.badRequest(`Only ${item.variant.stock} left in stock`);
  }

  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });

  return getCart(owner);
}

async function removeItem(owner, itemId) {
  const item = await findOwnedItem(owner, itemId);

  await prisma.cartItem.delete({ where: { id: item.id } });

  return getCart(owner);
}

async function clearCart(owner) {
  const cart = await prisma.cart.findFirst({ where: ownerWhere(owner) });

  // Nothing to clear is a success, not a 404 — the caller wanted an empty
  // cart and an empty cart is what they have.
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return getCart(owner);
}

/**
 * Folds a guest cart into the signed-in customer's cart.
 *
 * Called after login and after signup, when the browser still holds the
 * session id it was shopping under. Without this step, signing in silently
 * empties the basket the customer just filled — one of the most reliable ways
 * to lose a sale.
 *
 * Quantities are summed and then clamped to stock, and the guest cart is
 * deleted so the same items cannot be merged twice.
 */
async function mergeGuestCart({ userId, sessionId }) {
  if (!userId || !sessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { variant: { select: { stock: true } } } } },
  });

  if (!guestCart) return;

  // Nothing to move, but the empty shell still holds the sessionId, which is
  // unique — leaving it behind would collide the next time that cookie value
  // came round.
  if (guestCart.items.length === 0) {
    await prisma.cart.delete({ where: { id: guestCart.id } });
    return;
  }

  const userCart = await getOrCreateCart({ userId });

  const existingItems = await prisma.cartItem.findMany({
    where: { cartId: userCart.id },
  });

  const quantityByVariant = new Map(
    existingItems.map((item) => [item.variantId, item.quantity])
  );

  // Every write is queued first and handed to $transaction as an array.
  //
  // The array form matters here rather than the callback form: this runs on
  // the login path, straight after a ~250ms bcrypt compare, and an interactive
  // transaction would hold a connection open across all of those awaits with a
  // 5s timeout hanging over it. A cold Neon connection can miss that window,
  // and the merge failing is exactly the lost basket it exists to prevent.
  const writes = [];

  for (const item of guestCart.items) {
    const combined = (quantityByVariant.get(item.variantId) ?? 0) + item.quantity;
    const quantity = Math.min(combined, item.variant.stock);

    // Stock ran out while the guest was browsing. Skip rather than fail the
    // whole login over one item.
    if (quantity < 1) continue;

    writes.push(
      prisma.cartItem.upsert({
        where: {
          cartId_variantId: { cartId: userCart.id, variantId: item.variantId },
        },
        create: { cartId: userCart.id, variantId: item.variantId, quantity },
        update: { quantity },
      })
    );
  }

  // Deleting the guest cart cascades to its items, and it goes in the same
  // transaction as the upserts: a merge that half-applied would leave the same
  // items in two carts with no way to tell which was authoritative.
  writes.push(prisma.cart.delete({ where: { id: guestCart.id } }));

  await prisma.$transaction(writes);
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeGuestCart,
};
