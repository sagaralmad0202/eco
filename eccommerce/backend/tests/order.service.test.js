const { Prisma } = require("@prisma/client");

const Decimal = Prisma.Decimal;

const mockTx = {
  address: { findFirst: jest.fn() },
  cart: { findUnique: jest.fn() },
  cartItem: { deleteMany: jest.fn() },
  coupon: { findUnique: jest.fn(), updateMany: jest.fn() },
  order: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockPrisma = {
  $transaction: jest.fn(),
  order: {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
};

jest.mock("../src/lib/prisma", () => mockPrisma);

const orderService = require("../src/modules/orders/order.service");

const USER_ID = "8c04efed-21f2-4389-9782-e4ec3aacd702";
const OTHER_USER_ID = "6e94238a-09f7-451a-ac9a-832e7d4e8086";
const ADDRESS_ID = "6260e191-dbb1-44a5-a204-ac8347a21ba5";
const ORDER_ID = "a1aa64e6-67e4-4b07-80b1-da9ec83cac93";

function makeAddress() {
  return {
    id: ADDRESS_ID,
    userId: USER_ID,
    fullName: "Asha Rao",
    phone: "9876543210",
    line1: "12 Market Road",
    line2: null,
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    country: "IN",
  };
}

function makeCartItem(overrides = {}) {
  return {
    id: "a49f1f9c-444f-4ad9-9f97-b87750462861",
    quantity: 2,
    variant: {
      id: "143be465-3d74-4e62-a818-af46e9ea885d",
      sku: "TEE-BLK-M",
      title: "Black / M",
      price: new Decimal("100.00"),
      stock: 5,
      isActive: true,
      product: {
        id: "57e0d023-87fe-4c40-98c4-4b6f93ab1831",
        name: "Classic Tee",
        image: "https://images.example/classic-tee.jpg",
        images: [],
        isActive: true,
      },
    },
    ...overrides,
  };
}

function makeCart(items = [makeCartItem()]) {
  return {
    id: "13656f30-b4bd-449e-a826-bf539450bc29",
    userId: USER_ID,
    items,
  };
}

function makeOrder(overrides = {}) {
  return {
    id: ORDER_ID,
    orderNumber: "ORD-2026-ABC1234567",
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
    placedAt: new Date("2026-08-11T12:00:00.000Z"),
    updatedAt: new Date("2026-08-11T12:00:00.000Z"),
    items: [
      {
        id: "ddd9ae1d-960d-43ca-be3f-576548441668",
        orderId: ORDER_ID,
        variantId: "143be465-3d74-4e62-a818-af46e9ea885d",
        productName: "Classic Tee",
        imageUrl: "https://images.example/classic-tee.jpg",
        variantTitle: "Black / M",
        sku: "TEE-BLK-M",
        unitPrice: new Decimal("100.00"),
        quantity: 2,
        lineTotal: new Decimal("200.00"),
      },
    ],
    payments: [
      {
        id: "4644ad1f-84dc-41bc-b6e0-3fc1a8474d82",
        orderId: ORDER_ID,
        provider: "razorpay",
        providerOrderId: null,
        providerPaymentId: null,
        amount: new Decimal("241.00"),
        currency: "INR",
        status: "PENDING",
        rawPayload: null,
        createdAt: new Date("2026-08-11T12:00:00.000Z"),
        updatedAt: new Date("2026-08-11T12:00:00.000Z"),
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.$transaction.mockImplementation((callback) => callback(mockTx));
  mockTx.address.findFirst.mockResolvedValue(makeAddress());
  mockTx.cart.findUnique.mockResolvedValue(makeCart());
  mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 });
  mockTx.coupon.updateMany.mockResolvedValue({ count: 1 });
  mockTx.order.create.mockResolvedValue(makeOrder());
  mockTx.order.findUnique.mockResolvedValue(makeOrder());
  mockTx.order.updateMany.mockResolvedValue({ count: 1 });
});

describe("createOrder", () => {
  test("creates snapshots, totals, and a pending payment while retaining the cart", async () => {
    const result = await orderService.createOrder(USER_ID, {
      addressId: ADDRESS_ID,
    });

    expect(mockTx.address.findFirst).toHaveBeenCalledWith({
      where: { id: ADDRESS_ID, userId: USER_ID },
    });
    expect(mockTx.cart.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID } }),
    );

    const createData = mockTx.order.create.mock.calls[0][0].data;
    expect(createData.subtotal.toFixed(2)).toBe("200.00");
    expect(createData.discount.toFixed(2)).toBe("0.00");
    expect(createData.shippingFee.toFixed(2)).toBe("5.00");
    expect(createData.tax.toFixed(2)).toBe("36.00");
    expect(createData.total.toFixed(2)).toBe("241.00");
    expect(createData.shippingName).toBe("Asha Rao");
    expect(createData.items.create[0]).toEqual(
      expect.objectContaining({
        productName: "Classic Tee",
        imageUrl: "https://images.example/classic-tee.jpg",
        variantTitle: "Black / M",
        sku: "TEE-BLK-M",
        quantity: 2,
      }),
    );
    expect(createData.items.create[0].unitPrice.toFixed(2)).toBe("100.00");
    expect(createData.items.create[0].lineTotal.toFixed(2)).toBe("200.00");
    expect(createData.payments.create.status).toBe("PENDING");
    expect(createData.payments.create.amount.toFixed(2)).toBe("241.00");
    expect(mockTx.cartItem.deleteMany).not.toHaveBeenCalled();
    expect(result.total).toBe("241.00");
    expect(result.items[0].unitPrice).toBe("100.00");
    expect(result.paymentStatus).toBe("PENDING");
    expect(result.payments[0]).not.toHaveProperty("rawPayload");
    expect(mockPrisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 10000,
      timeout: 30000,
    });
  });

  test("uses authoritative prices for multiple cart items", async () => {
    const second = makeCartItem({
      id: "e80cadf0-4be8-4926-b202-2857761dd20c",
      quantity: 3,
      variant: {
        ...makeCartItem().variant,
        id: "e7485911-340c-46ea-a18e-b52f957bda76",
        sku: "CAP-RED",
        title: "Red",
        price: new Decimal("25.50"),
        product: {
          id: "243be0bc-e8e0-40f5-a09d-85980c20f9ae",
          name: "Everyday Cap",
          image: null,
          images: [{ url: "https://images.example/everyday-cap.jpg" }],
          isActive: true,
        },
      },
    });
    mockTx.cart.findUnique.mockResolvedValue(
      makeCart([makeCartItem(), second]),
    );

    await orderService.createOrder(USER_ID, { addressId: ADDRESS_ID });

    const data = mockTx.order.create.mock.calls[0][0].data;
    expect(data.subtotal.toFixed(2)).toBe("276.50");
    expect(data.tax.toFixed(2)).toBe("49.77");
    expect(data.total.toFixed(2)).toBe("331.27");
    expect(data.items.create).toHaveLength(2);
    expect(data.items.create[1].imageUrl).toBe(
      "https://images.example/everyday-cap.jpg",
    );
  });

  test("rejects a missing address without leaking ownership", async () => {
    mockTx.address.findFirst.mockResolvedValue(null);

    await expect(
      orderService.createOrder(USER_ID, { addressId: ADDRESS_ID }),
    ).rejects.toMatchObject({ statusCode: 404, message: "Address not found" });
    expect(mockTx.order.create).not.toHaveBeenCalled();
  });

  test("rejects an empty cart", async () => {
    mockTx.cart.findUnique.mockResolvedValue(makeCart([]));

    await expect(
      orderService.createOrder(USER_ID, { addressId: ADDRESS_ID }),
    ).rejects.toMatchObject({ statusCode: 400, message: "Cart is empty" });
  });

  test("rejects a missing product relation", async () => {
    mockTx.cart.findUnique.mockResolvedValue(
      makeCart([makeCartItem({ variant: null })]),
    );

    await expect(
      orderService.createOrder(USER_ID, { addressId: ADDRESS_ID }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Cart contains a product that is no longer available",
    });
  });

  test("rejects inactive products and variants", async () => {
    const item = makeCartItem();
    item.variant.isActive = false;
    mockTx.cart.findUnique.mockResolvedValue(makeCart([item]));

    await expect(
      orderService.createOrder(USER_ID, { addressId: ADDRESS_ID }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rejects insufficient stock", async () => {
    const item = makeCartItem();
    item.variant.stock = 1;
    mockTx.cart.findUnique.mockResolvedValue(makeCart([item]));

    await expect(
      orderService.createOrder(USER_ID, { addressId: ADDRESS_ID }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("Only 1"),
    });
  });

  test("validates and atomically consumes a coupon", async () => {
    mockTx.coupon.findUnique.mockResolvedValue({
      id: "ec1b0683-f423-43bd-8b0f-e84fbad10e16",
      code: "SAVE10",
      discountType: "PERCENT",
      value: new Decimal("10.00"),
      minOrderTotal: new Decimal("100.00"),
      maxDiscount: null,
      usageLimit: 10,
      usedCount: 2,
      startsAt: null,
      expiresAt: null,
      isActive: true,
    });

    await orderService.createOrder(USER_ID, {
      addressId: ADDRESS_ID,
      couponCode: "SAVE10",
    });

    const data = mockTx.order.create.mock.calls[0][0].data;
    expect(data.discount.toFixed(2)).toBe("20.00");
    expect(data.tax.toFixed(2)).toBe("32.40");
    expect(data.total.toFixed(2)).toBe("217.40");
    expect(data.couponCode).toBe("SAVE10");
    expect(mockTx.coupon.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { usedCount: { increment: 1 } } }),
    );
  });

  test("rejects an exhausted coupon", async () => {
    mockTx.coupon.findUnique.mockResolvedValue({
      id: "ec1b0683-f423-43bd-8b0f-e84fbad10e16",
      code: "USED",
      discountType: "FIXED",
      value: new Decimal("20.00"),
      minOrderTotal: null,
      maxDiscount: null,
      usageLimit: 1,
      usedCount: 1,
      startsAt: null,
      expiresAt: null,
      isActive: true,
    });

    await expect(
      orderService.createOrder(USER_ID, {
        addressId: ADDRESS_ID,
        couponCode: "USED",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Coupon usage limit has been reached",
    });
  });

  test("does not clear the cart if order creation fails", async () => {
    mockTx.order.create.mockRejectedValue(new Error("database write failed"));

    await expect(
      orderService.createOrder(USER_ID, { addressId: ADDRESS_ID }),
    ).rejects.toThrow("database write failed");
    expect(mockTx.cartItem.deleteMany).not.toHaveBeenCalled();
  });
});

describe("order retrieval", () => {
  test("lists only the authenticated user's orders with pagination", async () => {
    const order = makeOrder();
    order.items[0].variant = {
      product: {
        id: "57e0d023-87fe-4c40-98c4-4b6f93ab1831",
        slug: "classic-tee",
        image: "https://images.example/classic-tee.jpg",
        images: [],
      },
    };
    mockPrisma.order.count.mockResolvedValue(1);
    mockPrisma.order.findMany.mockResolvedValue([order]);

    const result = await orderService.listOrders(USER_ID, {
      page: 2,
      limit: 5,
    });

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID },
        skip: 5,
        take: 5,
      }),
    );
    expect(result.items[0].total).toBe("241.00");
    expect(result.items[0].items[0].productId).toBe(
      "57e0d023-87fe-4c40-98c4-4b6f93ab1831",
    );
    expect(result.pagination).toEqual(
      expect.objectContaining({ page: 2, limit: 5, total: 1, hasPrev: true }),
    );
  });

  test("gets an order with ownership in the query", async () => {
    mockPrisma.order.findFirst.mockResolvedValue(makeOrder());

    await orderService.getOrder(USER_ID, ORDER_ID);

    expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ORDER_ID, userId: USER_ID } }),
    );
  });

  test("returns a current product image for a legacy item without a snapshot", async () => {
    const legacyOrder = makeOrder();
    legacyOrder.items[0] = {
      ...legacyOrder.items[0],
      imageUrl: null,
      variant: {
        product: {
          slug: "classic-tee",
          image: null,
          images: [{ url: "https://images.example/legacy-item.jpg" }],
        },
      },
    };
    mockPrisma.order.findFirst.mockResolvedValue(legacyOrder);

    const result = await orderService.getOrder(USER_ID, ORDER_ID);

    expect(result.items[0].imageUrl).toBe(
      "https://images.example/legacy-item.jpg",
    );
    expect(result.items[0]).not.toHaveProperty("variant");
    expect(result.items[0].productSlug).toBe("classic-tee");
  });

  test("hides another user's order behind a 404", async () => {
    mockPrisma.order.findFirst.mockResolvedValue(null);

    await expect(
      orderService.getOrder(OTHER_USER_ID, ORDER_ID),
    ).rejects.toMatchObject({ statusCode: 404, message: "Order not found" });
  });
});

describe("cancelOrder", () => {
  test.each(["PENDING", "CONFIRMED"])("cancels a %s order", async (status) => {
    mockTx.order.findFirst.mockResolvedValue(makeOrder({ status }));
    mockTx.order.findUnique.mockResolvedValue(
      makeOrder({ status: "CANCELLED" }),
    );

    const result = await orderService.cancelOrder(USER_ID, ORDER_ID);

    expect(mockTx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: ORDER_ID,
        userId: USER_ID,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      data: { status: "CANCELLED" },
    });
    expect(result.status).toBe("CANCELLED");
    expect(result.paymentStatus).toBe("PENDING");
  });

  test("releases a reserved coupon exactly when cancellation wins", async () => {
    mockTx.order.findFirst.mockResolvedValue(
      makeOrder({ status: "PENDING", couponCode: "SAVE10" }),
    );
    mockTx.order.findUnique.mockResolvedValue(
      makeOrder({ status: "CANCELLED", couponCode: "SAVE10" }),
    );

    await orderService.cancelOrder(USER_ID, ORDER_ID);

    expect(mockTx.coupon.updateMany).toHaveBeenCalledWith({
      where: { code: "SAVE10", usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  });

  test("rejects an already cancelled order", async () => {
    mockTx.order.findFirst.mockResolvedValue(
      makeOrder({ status: "CANCELLED" }),
    );

    await expect(
      orderService.cancelOrder(USER_ID, ORDER_ID),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Order is already cancelled",
    });
  });

  test.each(["PACKED", "SHIPPED", "DELIVERED", "RETURNED"])(
    "rejects cancellation in %s status",
    async (status) => {
      mockTx.order.findFirst.mockResolvedValue(makeOrder({ status }));

      await expect(
        orderService.cancelOrder(USER_ID, ORDER_ID),
      ).rejects.toMatchObject({ statusCode: 409 });
    },
  );

  test("cannot cancel another user's order", async () => {
    mockTx.order.findFirst.mockResolvedValue(null);

    await expect(
      orderService.cancelOrder(OTHER_USER_ID, ORDER_ID),
    ).rejects.toMatchObject({ statusCode: 404, message: "Order not found" });
    expect(mockTx.order.updateMany).not.toHaveBeenCalled();
  });
});
