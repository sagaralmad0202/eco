const { Prisma } = require("@prisma/client");

const Decimal = Prisma.Decimal;

describe("Inventory Reservation & Concurrency System", () => {
  let mockPrisma;
  let mockTx;
  let orderService;
  let reservationSweep;

  const USER_A = "user-a-1111-1111-1111-111111111111";
  const USER_B = "user-b-2222-2222-2222-222222222222";
  const ADDRESS_ID = "addr-3333-3333-3333-333333333333";
  const VARIANT_ID = "var-last-item-4444-444444444444";

  beforeEach(() => {
    jest.resetModules();

    mockTx = {
      address: {
        findFirst: jest.fn().mockResolvedValue({
          id: ADDRESS_ID,
          userId: USER_A,
          fullName: "Customer",
          phone: "9876543210",
          line1: "123 Main St",
          line2: null,
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
          country: "IN",
        }),
      },
      cart: {
        findUnique: jest.fn().mockImplementation(({ where }) => ({
          id: `cart-${where.userId}`,
          userId: where.userId,
          items: [
            {
              id: `item-${where.userId}`,
              quantity: 1,
              variant: {
                id: VARIANT_ID,
                sku: "RARE-ITEM-1",
                title: "One Size",
                price: new Decimal("500.00"),
                stock: 1,
                isActive: true,
                product: {
                  id: "prod-rare-1",
                  name: "Limited Edition Jacket",
                  image: null,
                  images: [],
                  isActive: true,
                },
              },
            },
          ],
        })),
      },
      productVariant: {
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      coupon: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      order: {
        create: jest.fn().mockImplementation(({ data }) => ({
          ...data,
          items: data.items.create,
          payments: [data.payments.create],
        })),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    mockPrisma = {
      $transaction: jest.fn().mockImplementation((callback) => callback(mockTx)),
      order: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    jest.doMock("../src/lib/prisma", () => mockPrisma);
    orderService = require("../src/modules/orders/order.service");
    reservationSweep = require("../src/lib/reservationSweep");
  });

  test("concurrent checkouts for the last item: exactly one wins reservation, second receives 409 Conflict", async () => {
    // Simulate real-world database atomic conditional decrement:
    // Only the first caller that sees stock >= 1 decrements it; the second gets count: 0
    let availableStock = 1;
    mockTx.productVariant.updateMany.mockImplementation(({ where, data }) => {
      if (availableStock >= where.stock.gte) {
        availableStock -= data.stock.decrement;
        return Promise.resolve({ count: 1 });
      }
      return Promise.resolve({ count: 0 });
    });

    const [attemptA, attemptB] = await Promise.allSettled([
      orderService.createOrder(USER_A, { addressId: ADDRESS_ID }),
      orderService.createOrder(USER_B, { addressId: ADDRESS_ID }),
    ]);

    // Exactly one must succeed
    const successfulAttempts = [attemptA, attemptB].filter((r) => r.status === "fulfilled");
    const rejectedAttempts = [attemptA, attemptB].filter((r) => r.status === "rejected");

    expect(successfulAttempts).toHaveLength(1);
    expect(rejectedAttempts).toHaveLength(1);

    // Winner gets an order with 15-minute reservation TTL
    const winningOrder = successfulAttempts[0].value;
    expect(winningOrder.status).toBe("PENDING");
    expect(winningOrder.expiresAt).toBeDefined();

    // Loser gets rejected with 409 Conflict and NO order created
    const losingError = rejectedAttempts[0].reason;
    expect(losingError.statusCode).toBe(409);
    expect(losingError.message).toContain("Insufficient stock");
    expect(mockTx.order.create).toHaveBeenCalledTimes(1);
  });

  test("cancelling an order restores the reserved inventory back to available stock", async () => {
    mockTx.order.findFirst.mockResolvedValue({
      id: "ord-test-1",
      userId: USER_A,
      status: "PENDING",
      couponCode: null,
      items: [{ variantId: VARIANT_ID, quantity: 1 }],
    });
    mockTx.order.findUnique.mockResolvedValue({
      id: "ord-test-1",
      userId: USER_A,
      status: "CANCELLED",
      subtotal: new Decimal("500.00"),
      discount: new Decimal("0.00"),
      shippingFee: new Decimal("0.00"),
      tax: new Decimal("0.00"),
      total: new Decimal("500.00"),
      items: [],
      payments: [],
    });
    mockTx.productVariant.updateMany.mockResolvedValue({ count: 1 });

    const result = await orderService.cancelOrder(USER_A, "ord-test-1");

    expect(result.status).toBe("CANCELLED");
    expect(mockTx.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: VARIANT_ID },
      data: { stock: { increment: 1 } },
    });
  });

  test("reservation sweeper automatically restores inventory when order expires without payment", async () => {
    const expiredOrder = {
      id: "ord-expired-1",
      userId: USER_A,
      status: "PENDING",
      couponCode: null,
      expiresAt: new Date(Date.now() - 60 * 1000), // expired 1 min ago
      items: [{ variantId: VARIANT_ID, quantity: 2 }],
    };

    mockPrisma.order.findMany.mockResolvedValue([expiredOrder]);
    mockTx.order.updateMany.mockResolvedValue({ count: 1 });
    mockTx.productVariant.updateMany.mockResolvedValue({ count: 1 });

    const released = await reservationSweep.runReservationSweep();

    expect(released).toBe(1);
    expect(mockTx.order.updateMany).toHaveBeenCalledWith({
      where: { id: "ord-expired-1", status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    expect(mockTx.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: VARIANT_ID },
      data: { stock: { increment: 2 } },
    });
  });
});
