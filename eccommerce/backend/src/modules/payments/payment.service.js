const { createHmac, randomUUID, timingSafeEqual } = require("crypto");

const prisma = require("../../lib/prisma");
const {
  CHECKOUT_TRANSACTION_OPTIONS,
} = require("../../lib/transactionOptions");
const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");
const { toMinorUnits, toMoneyString } = require("../../utils/money");
const { orderInclude, serialiseOrder } = require("../orders/order.service");
const { getRazorpayClient } = require("./razorpay.client");

const CREATING_PREFIX = "creating_";
const completeOrderInclude = orderInclude;

class StockUnavailableError extends Error {
  constructor(item) {
    super(`Insufficient stock for ${item.productName} (${item.variantTitle})`);
    this.item = item;
  }
}

function safeSignatureMatch(message, receivedSignature, secret) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(receivedSignature ?? "")) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(message).digest();
  const received = Buffer.from(receivedSignature, "hex");

  return (
    received.length === expected.length && timingSafeEqual(expected, received)
  );
}

function verifyCheckoutSignature({
  providerOrderId,
  providerPaymentId,
  signature,
}) {
  return safeSignatureMatch(
    `${providerOrderId}|${providerPaymentId}`,
    signature,
    env.RAZORPAY_KEY_SECRET,
  );
}

function assertPayableOrder(order) {
  if (!order) throw ApiError.notFound("Order not found");

  if (
    order.status === "CONFIRMED" ||
    order.payments.some((p) => p.status === "PAID")
  ) {
    throw ApiError.conflict("Order is already paid");
  }

  if (order.status !== "PENDING") {
    throw ApiError.conflict(
      `An order in ${order.status} status cannot be paid`,
    );
  }

  if (order.total.lessThanOrEqualTo(0)) {
    throw ApiError.badRequest("Order amount must be greater than zero");
  }
}

async function claimPaymentAttempt(userId, orderId) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { payments: { orderBy: { createdAt: "desc" } } },
    });

    assertPayableOrder(order);

    const reusable = order.payments.find(
      (payment) =>
        payment.status === "PENDING" &&
        payment.providerOrderId?.startsWith("order_"),
    );

    if (reusable) return { order, payment: reusable, existing: true };

    if (
      order.payments.some((payment) =>
        payment.providerOrderId?.startsWith(CREATING_PREFIX),
      )
    ) {
      throw ApiError.conflict("Payment setup is already in progress");
    }

    const claim = `${CREATING_PREFIX}${randomUUID().replaceAll("-", "")}`;
    const placeholder = order.payments.find(
      (payment) => !payment.providerOrderId && payment.status !== "PAID",
    );

    if (placeholder) {
      const updated = await tx.payment.updateMany({
        where: {
          id: placeholder.id,
          providerOrderId: null,
          status: { in: ["PENDING", "FAILED"] },
        },
        data: {
          providerOrderId: claim,
          status: "PENDING",
          amount: order.total,
          currency: order.currency,
        },
      });

      if (updated.count !== 1) {
        throw ApiError.conflict("Payment setup is already in progress");
      }

      return {
        order,
        payment: { ...placeholder, providerOrderId: claim, status: "PENDING" },
        existing: false,
      };
    }

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        provider: "razorpay",
        providerOrderId: claim,
        amount: order.total,
        currency: order.currency,
        status: "PENDING",
      },
    });

    return { order, payment, existing: false };
  }, CHECKOUT_TRANSACTION_OPTIONS);
}

function createOrderResponse(order, payment, providerOrderId, created) {
  return {
    created,
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: providerOrderId,
    amount: toMinorUnits(order.total),
    displayAmount: toMoneyString(order.total),
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
    paymentAttemptId: payment.id,
  };
}

async function createRazorpayOrder(userId, orderId) {
  const claimed = await claimPaymentAttempt(userId, orderId);

  if (claimed.existing) {
    const reconciled = await reconcileCapturedPayment(claimed.payment);
    if (reconciled) {
      return {
        created: false,
        reconciled: true,
        ...reconciled,
      };
    }

    return createOrderResponse(
      claimed.order,
      claimed.payment,
      claimed.payment.providerOrderId,
      false,
    );
  }

  const amount = toMinorUnits(claimed.order.total);

  try {
    const gatewayOrder = await getRazorpayClient().orders.create({
      amount,
      currency: claimed.order.currency,
      receipt: claimed.order.orderNumber,
      notes: {
        internalOrderId: claimed.order.id,
        internalOrderNumber: claimed.order.orderNumber,
      },
    });

    if (
      !gatewayOrder?.id?.startsWith("order_") ||
      gatewayOrder.amount !== amount ||
      gatewayOrder.currency !== claimed.order.currency
    ) {
      throw new Error("Razorpay returned inconsistent order data");
    }

    const persisted = await prisma.payment.updateMany({
      where: {
        id: claimed.payment.id,
        providerOrderId: claimed.payment.providerOrderId,
        status: "PENDING",
      },
      data: {
        providerOrderId: gatewayOrder.id,
        rawPayload: gatewayOrder,
      },
    });

    if (persisted.count !== 1) {
      throw new Error(
        "Payment attempt changed while Razorpay order was created",
      );
    }

    return createOrderResponse(
      claimed.order,
      claimed.payment,
      gatewayOrder.id,
      true,
    );
  } catch (error) {
    await prisma.payment.updateMany({
      where: {
        id: claimed.payment.id,
        providerOrderId: claimed.payment.providerOrderId,
      },
      data: {
        providerOrderId: null,
        status: "FAILED",
        rawPayload: {
          stage: "razorpay_order_creation",
          message: error.message || "Razorpay order creation failed",
        },
      },
    });

    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "Could not start Razorpay checkout. Please retry.");
  }
}

function assertGatewayPayment(payment, internalPayment) {
  const expectedAmount = toMinorUnits(internalPayment.amount);

  if (
    payment.id !== internalPayment.providerPaymentId &&
    internalPayment.providerPaymentId
  ) {
    throw ApiError.conflict("Payment id does not match this payment attempt");
  }

  if (
    payment.order_id !== internalPayment.providerOrderId ||
    payment.amount !== expectedAmount ||
    payment.currency !== internalPayment.currency
  ) {
    throw ApiError.badRequest(
      "Razorpay payment details do not match the order",
    );
  }
}

async function removeOrderedItemsFromCart(tx, userId, orderItems) {
  if (!userId) return;

  const cart = await tx.cart.findUnique({ where: { userId } });
  if (!cart) return;

  for (const item of orderItems) {
    if (!item.variantId) continue;

    const cartItem = await tx.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId: item.variantId },
      },
    });

    if (!cartItem) continue;

    if (cartItem.quantity <= item.quantity) {
      await tx.cartItem.delete({ where: { id: cartItem.id } });
    } else {
      await tx.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: { decrement: item.quantity } },
      });
    }
  }
}

async function recordCapturedButUnfulfillable({
  paymentId,
  providerPaymentId,
  signature,
  payload,
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw ApiError.notFound("Payment attempt not found");

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerPaymentId,
        signature: signature ?? payment.signature,
        rawPayload: payload,
      },
    });

    await tx.order.updateMany({
      where: { id: payment.orderId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });

    const order = await tx.order.findUnique({
      where: { id: payment.orderId },
      include: completeOrderInclude,
    });

    return {
      confirmed: false,
      stockFailure: true,
      refundRequired: true,
      order: serialiseOrder(order),
    };
  }, CHECKOUT_TRANSACTION_OPTIONS);
}

async function finalizeCapturedPayment({
  paymentId,
  providerPaymentId,
  signature,
  payload,
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: { include: { items: true } },
        },
      });

      if (!payment) throw ApiError.notFound("Payment attempt not found");

      if (payment.status === "PAID") {
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
          include: completeOrderInclude,
        });
        return {
          confirmed: order.status === "CONFIRMED",
          stockFailure: order.status === "CANCELLED",
          refundRequired: order.status === "CANCELLED",
          order: serialiseOrder(order),
        };
      }

      if (payment.order.status !== "PENDING") {
        throw new StockUnavailableError({
          productName: "Order",
          variantTitle: payment.order.status,
        });
      }

      // This conditional update is the idempotency claim. A callback and a
      // webhook racing each other serialize on this row; only one can change
      // it from PENDING/FAILED to PAID and therefore only one deducts stock.
      const claimed = await tx.payment.updateMany({
        where: { id: payment.id, status: { in: ["PENDING", "FAILED"] } },
        data: {
          status: "PAID",
          providerPaymentId,
          signature: signature ?? payment.signature,
          rawPayload: payload,
        },
      });

      if (claimed.count !== 1) {
        throw ApiError.conflict("Payment state changed; retry verification");
      }

      for (const item of payment.order.items) {
        if (!item.variantId) throw new StockUnavailableError(item);

        const stock = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            isActive: true,
            stock: { gte: item.quantity },
            product: { isActive: true },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (stock.count !== 1) throw new StockUnavailableError(item);
      }

      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: "CONFIRMED" },
      });

      await removeOrderedItemsFromCart(
        tx,
        payment.order.userId,
        payment.order.items,
      );

      const order = await tx.order.findUnique({
        where: { id: payment.order.id },
        include: completeOrderInclude,
      });

      return {
        confirmed: true,
        stockFailure: false,
        refundRequired: false,
        order: serialiseOrder(order),
      };
    }, CHECKOUT_TRANSACTION_OPTIONS);
  } catch (error) {
    if (!(error instanceof StockUnavailableError)) throw error;

    // The gateway has already captured money. Preserve that financial truth,
    // cancel fulfillment, and surface the need for a refund instead of lying
    // that payment failed or allowing inventory to go negative.
    return recordCapturedButUnfulfillable({
      paymentId,
      providerPaymentId,
      signature,
      payload: { ...payload, fulfillmentError: error.message },
    });
  }
}

async function reconcileCapturedPayment(payment) {
  let collection;
  try {
    collection = await getRazorpayClient().orders.fetchPayments(
      payment.providerOrderId,
    );
  } catch {
    throw new ApiError(
      502,
      "Could not check the existing payment with Razorpay. Please retry.",
    );
  }

  const captured = (collection.items ?? []).filter(
    (candidate) => candidate.status === "captured",
  );

  if (captured.length === 0) return null;
  if (captured.length > 1) {
    throw ApiError.conflict(
      "Multiple captured payments were found for this order. Contact support.",
    );
  }

  const gatewayPayment = captured[0];
  assertGatewayPayment(gatewayPayment, {
    ...payment,
    providerPaymentId: gatewayPayment.id,
  });

  return finalizeCapturedPayment({
    paymentId: payment.id,
    providerPaymentId: gatewayPayment.id,
    signature: null,
    payload: gatewayPayment,
  });
}

async function verifyRazorpayPayment(userId, data) {
  const order = await prisma.order.findFirst({
    where: { id: data.orderId, userId },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) throw ApiError.notFound("Order not found");

  const payment = order.payments.find(
    (candidate) => candidate.providerOrderId === data.razorpayOrderId,
  );
  if (!payment) throw ApiError.notFound("Payment attempt not found");

  if (
    payment.status === "PAID" &&
    payment.providerPaymentId === data.razorpayPaymentId
  ) {
    const currentOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: completeOrderInclude,
    });
    return {
      confirmed: currentOrder.status === "CONFIRMED",
      stockFailure: currentOrder.status === "CANCELLED",
      refundRequired: currentOrder.status === "CANCELLED",
      order: serialiseOrder(currentOrder),
    };
  }

  // The order id in the HMAC input comes from our database. The callback copy
  // is used only to locate a matching owned attempt, never as authority.
  if (
    !verifyCheckoutSignature({
      providerOrderId: payment.providerOrderId,
      providerPaymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
    })
  ) {
    throw ApiError.badRequest("Razorpay signature verification failed");
  }

  let gatewayPayment;
  try {
    gatewayPayment = await getRazorpayClient().payments.fetch(
      data.razorpayPaymentId,
    );
  } catch {
    throw new ApiError(502, "Could not confirm payment with Razorpay. Retry.");
  }

  const paymentForValidation = {
    ...payment,
    providerPaymentId: payment.providerPaymentId ?? data.razorpayPaymentId,
  };
  assertGatewayPayment(gatewayPayment, paymentForValidation);

  if (gatewayPayment.status === "failed") {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { not: "PAID" } },
      data: {
        status: "FAILED",
        providerPaymentId: data.razorpayPaymentId,
        signature: data.razorpaySignature,
        rawPayload: gatewayPayment,
      },
    });
    throw ApiError.badRequest("Razorpay payment failed");
  }

  if (gatewayPayment.status !== "captured") {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { not: "PAID" } },
      data: {
        providerPaymentId: data.razorpayPaymentId,
        signature: data.razorpaySignature,
        rawPayload: gatewayPayment,
      },
    });
    return { confirmed: false, processing: true, order: serialiseOrder(order) };
  }

  return finalizeCapturedPayment({
    paymentId: payment.id,
    providerPaymentId: data.razorpayPaymentId,
    signature: data.razorpaySignature,
    payload: gatewayPayment,
  });
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyCheckoutSignature,
  finalizeCapturedPayment,
};
