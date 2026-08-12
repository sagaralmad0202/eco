const { createHmac } = require("crypto");
const { Prisma } = require("@prisma/client");

const Decimal = Prisma.Decimal;

const mockGateway = {
  orders: { create: jest.fn(), fetchPayments: jest.fn() },
  payments: { fetch: jest.fn() },
};

const mockTx = {
  order: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  productVariant: { updateMany: jest.fn() },
  cart: { findUnique: jest.fn() },
  cartItem: {
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

const mockPrisma = {
  $transaction: jest.fn(),
  order: { findFirst: jest.fn(), findUnique: jest.fn() },
  payment: { findUnique: jest.fn(), updateMany: jest.fn() },
};

jest.mock("../src/lib/prisma", () => mockPrisma);
jest.mock("../src/modules/payments/razorpay.client", () => ({
  getRazorpayClient: () => mockGateway,
}));

const paymentService = require("../src/modules/payments/payment.service");

const USER_ID = "8c04efed-21f2-4389-9782-e4ec3aacd702";
const ORDER_ID = "a1aa64e6-67e4-4b07-80b1-da9ec83cac93";
const PAYMENT_ID = "4644ad1f-84dc-41bc-b6e0-3fc1a8474d82";
const PROVIDER_ORDER_ID = "order_TestOrder123";
const PROVIDER_PAYMENT_ID = "pay_TestPayment123";

function payment(overrides = {}) {
  return {
    id: PAYMENT_ID,
    orderId: ORDER_ID,
    provider: "razorpay",
    providerOrderId: null,
    providerPaymentId: null,
    signature: null,
    amount: new Decimal("241.00"),
    currency: "INR",
    status: "PENDING",
    rawPayload: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function order(overrides = {}) {
  return {
    id: ORDER_ID,
    orderNumber: "ORD-2026-TESTORDER",
    userId: USER_ID,
    status: "PENDING",
    subtotal: new Decimal("200.00"),
    discount: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    tax: new Decimal("36.00"),
    total: new Decimal("241.00"),
    currency: "INR",
    shippingName: "Asha Rao",
    shippingPhone: "9876543210",
    shippingLine1: "12 Market Road",
    shippingLine2: null,
    shippingCity: "Bengaluru",
    shippingState: "Karnataka",
    shippingPostalCode: "560001",
    shippingCountry: "IN",
    couponCode: null,
    placedAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "ddd9ae1d-960d-43ca-be3f-576548441668",
        orderId: ORDER_ID,
        variantId: "143be465-3d74-4e62-a818-af46e9ea885d",
        productName: "Classic Tee",
        variantTitle: "Black / M",
        sku: "TEE-BLK-M",
        unitPrice: new Decimal("100.00"),
        quantity: 2,
        lineTotal: new Decimal("200.00"),
      },
    ],
    payments: [],
    ...overrides,
  };
}

function checkoutSignature() {
  return createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${PROVIDER_ORDER_ID}|${PROVIDER_PAYMENT_ID}`)
    .digest("hex");
}

function gatewayPayment(overrides = {}) {
  return {
    id: PROVIDER_PAYMENT_ID,
    order_id: PROVIDER_ORDER_ID,
    amount: 24100,
    currency: "INR",
    status: "captured",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGateway.orders.fetchPayments.mockResolvedValue({ count: 0, items: [] });
  mockPrisma.$transaction.mockImplementation((callback) => callback(mockTx));
  mockTx.payment.updateMany.mockResolvedValue({ count: 1 });
  mockTx.payment.update.mockResolvedValue(payment({ status: "PAID" }));
  mockTx.order.updateMany.mockResolvedValue({ count: 1 });
  mockTx.order.update.mockResolvedValue({});
  mockTx.productVariant.updateMany.mockResolvedValue({ count: 1 });
  mockTx.cart.findUnique.mockResolvedValue(null);
  mockTx.order.findUnique.mockResolvedValue(
    order({
      status: "CONFIRMED",
      payments: [
        payment({
          providerOrderId: PROVIDER_ORDER_ID,
          providerPaymentId: PROVIDER_PAYMENT_ID,
          status: "PAID",
        }),
      ],
    }),
  );
  mockPrisma.payment.updateMany.mockResolvedValue({ count: 1 });
});

describe("createRazorpayOrder", () => {
  test("creates a TEST-mode Razorpay order from the database amount", async () => {
    const placeholder = payment();
    mockTx.order.findFirst.mockResolvedValue(
      order({ payments: [placeholder] }),
    );
    mockGateway.orders.create.mockResolvedValue({
      id: PROVIDER_ORDER_ID,
      amount: 24100,
      currency: "INR",
    });

    const result = await paymentService.createRazorpayOrder(USER_ID, ORDER_ID);

    expect(mockGateway.orders.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 24100, currency: "INR" }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        orderId: ORDER_ID,
        razorpayOrderId: PROVIDER_ORDER_ID,
        amount: 24100,
        keyId: "rzp_test_unit_tests_only",
      }),
    );
    expect(JSON.stringify(result)).not.toContain(
      process.env.RAZORPAY_KEY_SECRET,
    );
  });

  test("returns an existing provider order idempotently", async () => {
    mockTx.order.findFirst.mockResolvedValue(
      order({ payments: [payment({ providerOrderId: PROVIDER_ORDER_ID })] }),
    );

    const result = await paymentService.createRazorpayOrder(USER_ID, ORDER_ID);

    expect(result.created).toBe(false);
    expect(mockGateway.orders.fetchPayments).toHaveBeenCalledWith(
      PROVIDER_ORDER_ID,
    );
    expect(mockGateway.orders.create).not.toHaveBeenCalled();
  });

  test("reconciles a captured payment instead of reopening a paid order", async () => {
    const attempt = payment({ providerOrderId: PROVIDER_ORDER_ID });
    mockTx.order.findFirst.mockResolvedValue(order({ payments: [attempt] }));
    mockGateway.orders.fetchPayments.mockResolvedValue({
      count: 1,
      items: [gatewayPayment()],
    });
    mockTx.payment.findUnique.mockResolvedValue(
      payment({ providerOrderId: PROVIDER_ORDER_ID, order: order() }),
    );

    const result = await paymentService.createRazorpayOrder(USER_ID, ORDER_ID);

    expect(result).toEqual(
      expect.objectContaining({
        created: false,
        reconciled: true,
        confirmed: true,
      }),
    );
    expect(mockGateway.orders.create).not.toHaveBeenCalled();
    expect(mockTx.productVariant.updateMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 10000,
      timeout: 30000,
    });
  });

  test("hides invalid and foreign-owned orders behind a 404", async () => {
    mockTx.order.findFirst.mockResolvedValue(null);

    await expect(
      paymentService.createRazorpayOrder(USER_ID, ORDER_ID),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("rejects an already paid order", async () => {
    mockTx.order.findFirst.mockResolvedValue(
      order({ status: "CONFIRMED", payments: [payment({ status: "PAID" })] }),
    );

    await expect(
      paymentService.createRazorpayOrder(USER_ID, ORDER_ID),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Order is already paid",
    });
  });

  test("rejects a zero amount before calling Razorpay", async () => {
    mockTx.order.findFirst.mockResolvedValue(
      order({ total: new Decimal("0.00"), payments: [payment()] }),
    );

    await expect(
      paymentService.createRazorpayOrder(USER_ID, ORDER_ID),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockGateway.orders.create).not.toHaveBeenCalled();
  });

  test("marks the attempt failed when Razorpay order creation fails", async () => {
    mockTx.order.findFirst.mockResolvedValue(order({ payments: [payment()] }));
    mockGateway.orders.create.mockRejectedValue(
      new Error("gateway unavailable"),
    );

    await expect(
      paymentService.createRazorpayOrder(USER_ID, ORDER_ID),
    ).rejects.toMatchObject({ statusCode: 502 });
    expect(mockPrisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED" }),
      }),
    );
  });
});

describe("verifyRazorpayPayment", () => {
  function prepareVerification(paymentOverrides = {}) {
    const attempt = payment({
      providerOrderId: PROVIDER_ORDER_ID,
      ...paymentOverrides,
    });
    mockPrisma.order.findFirst.mockResolvedValue(
      order({ payments: [attempt] }),
    );
    mockGateway.payments.fetch.mockResolvedValue(gatewayPayment());
    mockTx.payment.findUnique.mockResolvedValue(
      payment({
        providerOrderId: PROVIDER_ORDER_ID,
        order: order(),
      }),
    );
  }

  test("verifies HMAC, confirms the order, and deducts stock once", async () => {
    prepareVerification();
    mockTx.cart.findUnique.mockResolvedValue({
      id: "13656f30-b4bd-449e-a826-bf539450bc29",
    });
    mockTx.cartItem.findUnique.mockResolvedValue({
      id: "a49f1f9c-444f-4ad9-9f97-b87750462861",
      quantity: 2,
    });

    const result = await paymentService.verifyRazorpayPayment(USER_ID, {
      orderId: ORDER_ID,
      razorpayPaymentId: PROVIDER_PAYMENT_ID,
      razorpayOrderId: PROVIDER_ORDER_ID,
      razorpaySignature: checkoutSignature(),
    });

    expect(result.confirmed).toBe(true);
    expect(mockTx.productVariant.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ stock: { gte: 2 } }),
        data: { stock: { decrement: 2 } },
      }),
    );
    expect(mockTx.order.update).toHaveBeenCalledWith({
      where: { id: ORDER_ID },
      data: { status: "CONFIRMED" },
    });
    expect(mockTx.cartItem.delete).toHaveBeenCalledWith({
      where: { id: "a49f1f9c-444f-4ad9-9f97-b87750462861" },
    });
  });

  test("rejects an invalid signature without contacting Razorpay", async () => {
    prepareVerification();

    await expect(
      paymentService.verifyRazorpayPayment(USER_ID, {
        orderId: ORDER_ID,
        razorpayPaymentId: PROVIDER_PAYMENT_ID,
        razorpayOrderId: PROVIDER_ORDER_ID,
        razorpaySignature: "0".repeat(64),
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockGateway.payments.fetch).not.toHaveBeenCalled();
  });

  test("returns an already-paid verification without deducting stock again", async () => {
    prepareVerification({
      status: "PAID",
      providerPaymentId: PROVIDER_PAYMENT_ID,
    });
    mockPrisma.order.findUnique.mockResolvedValue(
      order({ status: "CONFIRMED", payments: [payment({ status: "PAID" })] }),
    );

    const result = await paymentService.verifyRazorpayPayment(USER_ID, {
      orderId: ORDER_ID,
      razorpayPaymentId: PROVIDER_PAYMENT_ID,
      razorpayOrderId: PROVIDER_ORDER_ID,
      razorpaySignature: checkoutSignature(),
    });

    expect(result.confirmed).toBe(true);
    expect(mockTx.productVariant.updateMany).not.toHaveBeenCalled();
  });

  test("duplicate captured finalization does not deduct stock twice", async () => {
    mockTx.payment.findUnique.mockResolvedValue(
      payment({
        status: "PAID",
        providerOrderId: PROVIDER_ORDER_ID,
        providerPaymentId: PROVIDER_PAYMENT_ID,
        order: order({ status: "CONFIRMED" }),
      }),
    );

    const result = await paymentService.finalizeCapturedPayment({
      paymentId: PAYMENT_ID,
      providerPaymentId: PROVIDER_PAYMENT_ID,
      payload: gatewayPayment(),
    });

    expect(result.confirmed).toBe(true);
    expect(mockTx.productVariant.updateMany).not.toHaveBeenCalled();
    expect(mockTx.cartItem.delete).not.toHaveBeenCalled();
  });

  test("records failed gateway payment state", async () => {
    prepareVerification();
    mockGateway.payments.fetch.mockResolvedValue(
      gatewayPayment({ status: "failed" }),
    );

    await expect(
      paymentService.verifyRazorpayPayment(USER_ID, {
        orderId: ORDER_ID,
        razorpayPaymentId: PROVIDER_PAYMENT_ID,
        razorpayOrderId: PROVIDER_ORDER_ID,
        razorpaySignature: checkoutSignature(),
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Razorpay payment failed",
    });
  });

  test("cancels fulfillment without negative stock when capture races inventory", async () => {
    prepareVerification();
    mockTx.productVariant.updateMany.mockResolvedValueOnce({ count: 0 });
    mockTx.payment.findUnique
      .mockResolvedValueOnce(
        payment({ providerOrderId: PROVIDER_ORDER_ID, order: order() }),
      )
      .mockResolvedValueOnce(payment({ providerOrderId: PROVIDER_ORDER_ID }));
    mockTx.order.findUnique.mockResolvedValue(
      order({ status: "CANCELLED", payments: [payment({ status: "PAID" })] }),
    );

    const result = await paymentService.verifyRazorpayPayment(USER_ID, {
      orderId: ORDER_ID,
      razorpayPaymentId: PROVIDER_PAYMENT_ID,
      razorpayOrderId: PROVIDER_ORDER_ID,
      razorpaySignature: checkoutSignature(),
    });

    expect(result).toEqual(
      expect.objectContaining({ stockFailure: true, refundRequired: true }),
    );
    expect(mockTx.order.updateMany).toHaveBeenCalledWith({
      where: { id: ORDER_ID, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  });
});
