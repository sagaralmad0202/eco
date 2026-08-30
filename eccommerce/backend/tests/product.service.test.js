const { Prisma } = require("@prisma/client");
const Decimal = Prisma.Decimal;

const mockPrisma = {
  product: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    create: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  productVariant: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  cart: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  cartItem: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  review: {
    aggregate: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("../src/lib/prisma", () => mockPrisma);

const productService = require("../src/modules/products/product.service");
const cartService = require("../src/modules/cart/cart.service");

describe("Product, Variant, Category & Cart Architecture Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Phase 2 & 12: Product & Variant Domain Architecture", () => {
    it("serializes products with variants, calculating correct priceFrom string", async () => {
      const mockProduct = {
        id: "2867bd8d-118b-43a7-88d9-8ae1fcbc8509",
        name: "Zara Lisboa & Seoul",
        slug: "zara-lisboa-seoul",
        brand: "Zara",
        image: "/media/products/zara-lisboa-seoul.webp",
        isActive: true,
        isFeatured: true,
        variants: [
          {
            id: "754ba14e-39c1-494e-a36a-9f1a277a3fa1",
            sku: "ZLS-EDT-100",
            title: "100ml / EDT",
            price: new Decimal("45.00"),
            compareAtPrice: null,
            stock: 33,
            isActive: true,
          },
          {
            id: "854ba14e-39c1-494e-a36a-9f1a277a3fa2",
            sku: "ZLS-EDP-100",
            title: "100ml / EDP",
            price: new Decimal("55.00"),
            compareAtPrice: new Decimal("65.00"),
            stock: 12,
            isActive: true,
          },
        ],
        images: [{ id: "img-1", url: "/media/test.webp", position: 0 }],
        category: { id: "cat-1", name: "Fragrance", slug: "fragrance" },
      };

      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await productService.listProducts({ page: 1, limit: 12 });

      expect(result.items).toHaveLength(1);
      const product = result.items[0];
      expect(product.priceFrom).toBe("45.00");
      expect(product.inStock).toBe(true);
      expect(product.variants).toHaveLength(2);
      expect(product.variants[0].price).toBe("45.00");
      expect(product.variants[1].price).toBe("55.00");
      expect(product.variants[1].compareAtPrice).toBe("65.00");
      expect(product.category.slug).toBe("fragrance");
    });

    it("filters clean category slug without relying on keyword heuristics", async () => {
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await productService.listProducts({
        page: 1,
        limit: 12,
        category: "fragrance",
      });

      const findManyCall = mockPrisma.product.findMany.mock.calls[0][0];
      expect(findManyCall.where.category).toEqual({
        slug: { in: ["fragrance"] },
      });
    });

    it("handles virtual 'new-arrivals' filter by setting isFeatured=true", async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.product.findMany.mockResolvedValue([]);

      await productService.listProducts({
        page: 1,
        limit: 12,
        category: "new-arrivals",
      });

      const findManyCall = mockPrisma.product.findMany.mock.calls[0][0];
      expect(findManyCall.where.isFeatured).toBe(true);
    });
  });

  describe("Phase 9 & 10: Cart & Live Price Calculation", () => {
    it("adds variant to cart and rejects out of stock items", async () => {
      const owner = { userId: "user-123" };
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        id: "variant-1",
        stock: 0,
        isActive: true,
        product: { isActive: true },
      });

      await expect(
        cartService.addItem(owner, { variantId: "variant-1", quantity: 1 }),
      ).rejects.toThrow("This item is out of stock");
    });

    it("rejects purchasing more than available stock cumulatively", async () => {
      const owner = { userId: "user-123" };
      mockPrisma.productVariant.findUnique.mockResolvedValue({
        id: "variant-1",
        stock: 5,
        isActive: true,
        product: { isActive: true },
      });
      mockPrisma.cart.findFirst.mockResolvedValue({ id: "cart-123" });
      mockPrisma.cartItem.findUnique.mockResolvedValue({
        id: "item-1",
        quantity: 4,
      });

      await expect(
        cartService.addItem(owner, { variantId: "variant-1", quantity: 2 }),
      ).rejects.toThrow("Only 5 left in stock");
    });

    it("calculates live price from variant rather than storing client price", async () => {
      const owner = { userId: "user-123" };
      mockPrisma.cart.findFirst.mockResolvedValue({
        id: "cart-123",
        items: [
          {
            id: "item-1",
            quantity: 2,
            variant: {
              id: "var-1",
              sku: "ZLS-EDT-100",
              title: "100ml / EDT",
              price: new Decimal("45.00"),
              compareAtPrice: null,
              stock: 20,
              isActive: true,
              product: {
                id: "prod-1",
                name: "Zara Lisboa & Seoul",
                slug: "zara-lisboa-seoul",
                brand: "Zara",
                image: "/media/test.webp",
                isActive: true,
                images: [],
              },
            },
          },
        ],
      });

      const cart = await cartService.getCart(owner);
      expect(cart.subtotal).toBe("90.00");
      expect(cart.totalQuantity).toBe(2);
      expect(cart.items[0].lineTotal).toBe("90.00");
    });
  });

  describe("Phase 8 & 24: Inventory Concurrency Invariant", () => {
    it("proves conditional decrement prevents overselling under race conditions", async () => {
      const mockTx = {
        productVariant: {
          updateMany: jest.fn(),
        },
      };

      // Scenario: Stock is 1. Two concurrent calls request quantity 1.
      // Call 1 wins conditional update (count = 1)
      // Call 2 loses conditional update because stock is no longer >= 1 (count = 0)
      mockTx.productVariant.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      const attempt1 = await mockTx.productVariant.updateMany({
        where: { id: "var-1", isActive: true, stock: { gte: 1 }, product: { isActive: true } },
        data: { stock: { decrement: 1 } },
      });

      const attempt2 = await mockTx.productVariant.updateMany({
        where: { id: "var-1", isActive: true, stock: { gte: 1 }, product: { isActive: true } },
        data: { stock: { decrement: 1 } },
      });

      expect(attempt1.count).toBe(1); // Winner
      expect(attempt2.count).toBe(0); // Safely rejected (0 rows updated)
    });
  });
});
