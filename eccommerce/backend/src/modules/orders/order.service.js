const { randomUUID } = require("crypto");

const prisma = require("../../lib/prisma");
const {
  CHECKOUT_TRANSACTION_OPTIONS,
} = require("../../lib/transactionOptions");
const ApiError = require("../../utils/ApiError");
const {
  ZERO,
  calculateDiscount,
  multiply,
  round,
  sum,
  toMoneyString,
} = require("../../utils/money");
const { calculateTotals } = require("../../utils/checkoutTotals");
const publicMediaUrl = require("../../utils/publicMediaUrl");

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"];

const orderInclude = {
  items: {
    include: {
      // imageUrl is an immutable snapshot. The current catalog image is used
      // only as a fallback for legacy rows created before the snapshot field.
      variant: {
        select: {
          product: {
            select: {
              id: true,
              slug: true,
              image: true,
              images: {
                orderBy: [{ position: "asc" }, { id: "asc" }],
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  },
  payments: {
    orderBy: { createdAt: "desc" },
    // Explicit selection keeps gateway audit data out of both the query result
    // and every customer-facing serializer by construction.
    select: {
      id: true,
      orderId: true,
      provider: true,
      providerOrderId: true,
      providerPaymentId: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

function generateOrderIdentity() {
  const id = randomUUID();
  const year = new Date().getUTCFullYear();
  const suffix = id.replaceAll("-", "").slice(0, 20).toUpperCase();

  return { id, orderNumber: `ORD-${year}-${suffix}` };
}

function serialisePayment(payment) {
  // rawPayload is retained for server-side reconciliation and disputes. It can
  // contain gateway metadata that has no place in a customer-facing response.
  return {
    id: payment.id,
    orderId: payment.orderId,
    provider: payment.provider,
    providerOrderId: payment.providerOrderId,
    providerPaymentId: payment.providerPaymentId,
    amount: toMoneyString(payment.amount),
    currency: payment.currency,
    status: payment.status,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

function serialiseOrderItem(item) {
  const { variant, ...snapshot } = item;

  return {
    ...snapshot,
    productId: variant?.product?.id ?? null,
    productSlug: variant?.product?.slug ?? null,
    imageUrl: publicMediaUrl(
      item.imageUrl ??
        variant?.product?.image ??
        variant?.product?.images?.[0]?.url ??
        null,
    ),
    unitPrice: toMoneyString(item.unitPrice),
    lineTotal: toMoneyString(item.lineTotal),
  };
}

function serialiseOrder(order) {
  const payments = (order.payments ?? []).map(serialisePayment);
  const paymentStatus =
    payments.find((payment) => payment.status === "PAID")?.status ??
    payments[0]?.status ??
    null;

  return {
    ...order,
    subtotal: toMoneyString(order.subtotal),
    discount: toMoneyString(order.discount),
    shippingFee: toMoneyString(order.shippingFee),
    tax: toMoneyString(order.tax),
    total: toMoneyString(order.total),
    items: (order.items ?? []).map(serialiseOrderItem),
    payments,
    paymentStatus,
  };
}

function validateCoupon(coupon, subtotal, now) {
  if (!coupon || !coupon.isActive) {
    throw ApiError.badRequest("Coupon is invalid or inactive");
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    throw ApiError.badRequest("Coupon is not active yet");
  }

  if (coupon.expiresAt && coupon.expiresAt <= now) {
    throw ApiError.badRequest("Coupon has expired");
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest("Coupon usage limit has been reached");
  }

  if (coupon.minOrderTotal && subtotal.lessThan(coupon.minOrderTotal)) {
    throw ApiError.badRequest(
      `Coupon requires a minimum subtotal of ${toMoneyString(coupon.minOrderTotal)}`,
    );
  }
}

async function consumeCoupon(tx, coupon, now) {
  const availability = [
    { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
    { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
  ];

  if (coupon.usageLimit != null) {
    availability.push({ usedCount: { lt: coupon.usageLimit } });
  }

  // The conditional update makes the usage limit safe under concurrent
  // checkouts. A read-then-increment would let two final uses both succeed.
  const result = await tx.coupon.updateMany({
    where: {
      id: coupon.id,
      isActive: true,
      AND: availability,
    },
    data: { usedCount: { increment: 1 } },
  });

  if (result.count !== 1) {
    throw ApiError.badRequest("Coupon is no longer available");
  }
}

async function createOrder(userId, { addressId, couponCode }) {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: addressId, userId },
    });

    // Ownership is deliberately part of the query. Returning the same 404 for
    // a missing and another customer's address prevents address ID probing.
    if (!address) throw ApiError.notFound("Address not found");

    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    isActive: true,
                    images: {
                      orderBy: [{ position: "asc" }, { id: "asc" }],
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Cart is empty");
    }

    const orderItems = cart.items.map((item) => {
      const { variant } = item;

      if (!variant?.product) {
        throw ApiError.badRequest(
          "Cart contains a product that is no longer available",
        );
      }

      if (!variant.isActive || !variant.product.isActive) {
        throw ApiError.badRequest(
          `${variant.product.name} (${variant.title}) is no longer available`,
        );
      }

      if (variant.stock < item.quantity) {
        throw ApiError.badRequest(
          `Only ${variant.stock} of ${variant.product.name} (${variant.title}) remain in stock`,
        );
      }

      const lineTotal = round(multiply(variant.price, item.quantity));

      return {
        variantId: variant.id,
        productName: variant.product.name,
        imageUrl:
          variant.product.image ?? variant.product.images[0]?.url ?? null,
        variantTitle: variant.title,
        sku: variant.sku,
        unitPrice: variant.price,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const subtotal = round(sum(orderItems.map((item) => item.lineTotal)));
    const now = new Date();
    let coupon = null;
    let discount = ZERO;

    if (couponCode) {
      coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
      validateCoupon(coupon, subtotal, now);
      discount = calculateDiscount({
        subtotal,
        discountType: coupon.discountType,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
      });
      await consumeCoupon(tx, coupon, now);
    }

    // Coupons reduce the taxable goods value. Reusing the cart helper keeps
    // shipping thresholds, tax rates and rounding identical at both stages.
    const goodsTotal = round(subtotal.sub(discount));
    const { shippingFee, tax, total } = calculateTotals(goodsTotal);
    const { id, orderNumber } = generateOrderIdentity();

    const order = await tx.order.create({
      data: {
        id,
        orderNumber,
        userId,
        status: "PENDING",
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        currency: "INR",
        shippingName: address.fullName,
        shippingPhone: address.phone,
        shippingLine1: address.line1,
        shippingLine2: address.line2,
        shippingCity: address.city,
        shippingState: address.state,
        shippingPostalCode: address.postalCode,
        shippingCountry: address.country,
        couponCode: coupon?.code ?? null,
        placedAt: now,
        items: { create: orderItems },
        payments: {
          create: {
            provider: "razorpay",
            amount: total,
            currency: "INR",
            status: "PENDING",
          },
        },
      },
      include: orderInclude,
    });
    return serialiseOrder(order);
  }, CHECKOUT_TRANSACTION_OPTIONS);
}

async function listOrders(userId, { page, limit }) {
  const where = { userId };
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: orderInclude,
    }),
  ]);

  return {
    items: orders.map(serialiseOrder),
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

async function getOrder(userId, id) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: orderInclude,
  });

  // 404 for both missing and foreign-owned IDs prevents order enumeration.
  if (!order) throw ApiError.notFound("Order not found");

  return serialiseOrder(order);
}

async function cancelOrder(userId, id) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id, userId } });

    if (!order) throw ApiError.notFound("Order not found");

    if (order.status === "CANCELLED") {
      throw ApiError.conflict("Order is already cancelled");
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw ApiError.conflict(
        `An order in ${order.status} status cannot be cancelled`,
      );
    }

    // Keep the status check in the write as well as the read. Two concurrent
    // state transitions cannot both win after validating stale state.
    const updated = await tx.order.updateMany({
      where: { id, userId, status: { in: CANCELLABLE_STATUSES } },
      data: { status: "CANCELLED" },
    });

    if (updated.count !== 1) {
      throw ApiError.conflict("Order status changed; refresh and try again");
    }

    // usedCount doubles as a coupon reservation count while a pending order is
    // retryable. Release that reservation exactly once when the status change
    // wins; duplicate cancellation requests cannot decrement it twice.
    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }

    const cancelled = await tx.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    // Payment state is intentionally untouched. A PAID payment remains PAID
    // until the future Razorpay refund workflow changes it to REFUNDED.
    return serialiseOrder(cancelled);
  });
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  serialiseOrder,
  orderInclude,
};
