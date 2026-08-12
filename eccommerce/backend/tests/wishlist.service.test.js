const { Prisma } = require("@prisma/client");

const mockPrisma = {
  product: { findUnique: jest.fn() },
  wishlist: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock("../src/lib/prisma", () => mockPrisma);

const wishlistService = require("../src/modules/wishlist/wishlist.service");

const USER_ID = "8c04efed-21f2-4389-9782-e4ec3aacd702";
const PRODUCT_ID = "57e0d023-87fe-4c40-98c4-4b6f93ab1831";
const WISHLIST_ID = "f1c82066-7038-455c-a079-cc017f87236d";

function makeEntry(overrides = {}) {
  return {
    id: WISHLIST_ID,
    userId: USER_ID,
    productId: PRODUCT_ID,
    createdAt: new Date("2026-08-12T08:00:00.000Z"),
    product: {
      id: PRODUCT_ID,
      name: "Linen Blazer",
      slug: "linen-blazer",
      brand: "Eco",
      image: "/media/products/linen-blazer.webp",
      isActive: true,
      images: [],
      variants: [
        {
          price: new Prisma.Decimal("95.00"),
          compareAtPrice: new Prisma.Decimal("125.00"),
          stock: 3,
        },
        {
          price: new Prisma.Decimal("105.00"),
          compareAtPrice: null,
          stock: 0,
        },
      ],
    },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.product.findUnique.mockResolvedValue({
    id: PRODUCT_ID,
    isActive: true,
  });
  mockPrisma.wishlist.findMany.mockResolvedValue([makeEntry()]);
  mockPrisma.wishlist.upsert.mockResolvedValue({ id: WISHLIST_ID });
  mockPrisma.wishlist.delete.mockResolvedValue({ id: WISHLIST_ID });
  mockPrisma.wishlist.deleteMany.mockResolvedValue({ count: 1 });
});

describe("listWishlist", () => {
  test("lists only the user rows newest first and serialises card data", async () => {
    const result = await wishlistService.listWishlist(USER_ID);

    expect(mockPrisma.wishlist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID },
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: WISHLIST_ID,
        addedAt: new Date("2026-08-12T08:00:00.000Z"),
        product: expect.objectContaining({
          id: PRODUCT_ID,
          image: "http://localhost:5000/media/products/linen-blazer.webp",
          priceFrom: "95.00",
          compareAtPrice: "125.00",
          inStock: true,
          available: true,
        }),
      }),
    ]);
  });

  test("falls back to the first gallery image", async () => {
    const entry = makeEntry();
    entry.product.image = null;
    entry.product.images = [{ url: "https://images.example/blazer.webp" }];
    mockPrisma.wishlist.findMany.mockResolvedValue([entry]);

    const result = await wishlistService.listWishlist(USER_ID);

    expect(result[0].product.image).toBe("https://images.example/blazer.webp");
  });
});

describe("addItem", () => {
  test("upserts an active product using the user/product unique key", async () => {
    await wishlistService.addItem(USER_ID, { productId: PRODUCT_ID });

    expect(mockPrisma.wishlist.upsert).toHaveBeenCalledWith({
      where: { userId_productId: { userId: USER_ID, productId: PRODUCT_ID } },
      create: { userId: USER_ID, productId: PRODUCT_ID },
      update: {},
    });
  });

  test.each([null, { id: PRODUCT_ID, isActive: false }])(
    "rejects a missing or inactive product",
    async (product) => {
      mockPrisma.product.findUnique.mockResolvedValue(product);

      await expect(
        wishlistService.addItem(USER_ID, { productId: PRODUCT_ID }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Product not found",
      });
      expect(mockPrisma.wishlist.upsert).not.toHaveBeenCalled();
    },
  );
});

describe("removeItem", () => {
  test("deletes with ownership in the query", async () => {
    await wishlistService.removeItem(USER_ID, PRODUCT_ID);

    expect(mockPrisma.wishlist.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, productId: PRODUCT_ID },
    });
  });

  test("returns 404 when the product is not in this user's wishlist", async () => {
    mockPrisma.wishlist.deleteMany.mockResolvedValue({ count: 0 });

    await expect(
      wishlistService.removeItem(USER_ID, PRODUCT_ID),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "That product is not in your wishlist",
    });
  });
});

describe("toggleItem", () => {
  test("removes an existing item", async () => {
    mockPrisma.wishlist.findUnique.mockResolvedValue({ id: WISHLIST_ID });

    const result = await wishlistService.toggleItem(USER_ID, {
      productId: PRODUCT_ID,
    });

    expect(mockPrisma.wishlist.delete).toHaveBeenCalledWith({
      where: { id: WISHLIST_ID },
    });
    expect(result.saved).toBe(false);
  });

  test("adds a missing item", async () => {
    mockPrisma.wishlist.findUnique.mockResolvedValue(null);

    const result = await wishlistService.toggleItem(USER_ID, {
      productId: PRODUCT_ID,
    });

    expect(mockPrisma.wishlist.upsert).toHaveBeenCalled();
    expect(result.saved).toBe(true);
  });
});

describe("clearWishlist", () => {
  test("clears only the authenticated user's rows and returns the count", async () => {
    mockPrisma.wishlist.deleteMany.mockResolvedValue({ count: 4 });

    await expect(wishlistService.clearWishlist(USER_ID)).resolves.toBe(4);
    expect(mockPrisma.wishlist.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
    });
  });
});
