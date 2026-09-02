const { Prisma } = require("@prisma/client");

// ---- Mock Prisma ----

const mockPrisma = {
  product: { findUnique: jest.fn() },
  review: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
};

jest.mock("../src/lib/prisma", () => mockPrisma);

const reviewService = require("../src/modules/reviews/review.service");

// ---- Fixtures ----

const USER_ID = "aabbccdd-1111-2222-3333-444444444444";
const OTHER_USER_ID = "aabbccdd-5555-6666-7777-888888888888";
const PRODUCT_ID = "11111111-aaaa-bbbb-cccc-dddddddddddd";
const REVIEW_ID = "22222222-aaaa-bbbb-cccc-dddddddddddd";

const NOW = new Date("2026-09-01T10:00:00.000Z");

function makeReviewRow(overrides = {}) {
  return {
    id: REVIEW_ID,
    rating: 5,
    title: "Excellent product",
    comment: "The quality is amazing!",
    createdAt: NOW,
    updatedAt: NOW,
    productId: PRODUCT_ID,
    userId: USER_ID,
    user: {
      id: USER_ID,
      fullName: "Jane Doe",
      avatarUrl: null,
    },
    ...overrides,
  };
}

// ---- Helpers ----

function mockActiveProduct() {
  mockPrisma.product.findUnique.mockResolvedValue({
    id: PRODUCT_ID,
    isActive: true,
  });
}

function mockInactiveProduct() {
  mockPrisma.product.findUnique.mockResolvedValue({
    id: PRODUCT_ID,
    isActive: false,
  });
}

function mockMissingProduct() {
  mockPrisma.product.findUnique.mockResolvedValue(null);
}

// ---- Tests ----

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getProductReviews", () => {
  test("returns paginated reviews for a product", async () => {
    mockActiveProduct();
    const reviews = [makeReviewRow()];
    mockPrisma.review.count.mockResolvedValue(1);
    mockPrisma.review.findMany.mockResolvedValue(reviews);

    const result = await reviewService.getProductReviews(PRODUCT_ID, {
      page: 1,
      limit: 10,
      sort: "newest",
    });

    expect(mockPrisma.review.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { productId: PRODUCT_ID } }),
    );
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: PRODUCT_ID },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      }),
    );
    expect(result.reviews).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  test("returns empty reviews for product with no reviews", async () => {
    mockActiveProduct();
    mockPrisma.review.count.mockResolvedValue(0);
    mockPrisma.review.findMany.mockResolvedValue([]);

    const result = await reviewService.getProductReviews(PRODUCT_ID, {
      page: 1,
      limit: 10,
      sort: "newest",
    });

    expect(result.reviews).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  test("applies rating filter when provided", async () => {
    mockActiveProduct();
    mockPrisma.review.count.mockResolvedValue(0);
    mockPrisma.review.findMany.mockResolvedValue([]);

    await reviewService.getProductReviews(PRODUCT_ID, {
      page: 1,
      limit: 10,
      sort: "newest",
      rating: 5,
    });

    expect(mockPrisma.review.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: PRODUCT_ID, rating: 5 },
      }),
    );
  });

  test("rejects non-existent product", async () => {
    mockMissingProduct();

    await expect(
      reviewService.getProductReviews(PRODUCT_ID, {
        page: 1,
        limit: 10,
        sort: "newest",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Product not found",
    });
  });

  test("rejects inactive product", async () => {
    mockInactiveProduct();

    await expect(
      reviewService.getProductReviews(PRODUCT_ID, {
        page: 1,
        limit: 10,
        sort: "newest",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Product not found",
    });
  });

  test("supports all sort options", async () => {
    mockActiveProduct();
    mockPrisma.review.count.mockResolvedValue(0);
    mockPrisma.review.findMany.mockResolvedValue([]);

    await reviewService.getProductReviews(PRODUCT_ID, {
      page: 1,
      limit: 10,
      sort: "highest_rating",
    });

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { rating: "desc" } }),
    );

    await reviewService.getProductReviews(PRODUCT_ID, {
      page: 1,
      limit: 10,
      sort: "lowest_rating",
    });

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { rating: "asc" } }),
    );
  });
});

describe("getReviewSummary", () => {
  test("returns aggregate stats and rating distribution", async () => {
    mockActiveProduct();
    mockPrisma.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.5 },
      _count: { rating: 87 },
    });
    mockPrisma.review.groupBy.mockResolvedValue([
      { rating: 5, _count: { _all: 50 } },
      { rating: 4, _count: { _all: 25 } },
      { rating: 3, _count: { _all: 8 } },
      { rating: 2, _count: { _all: 2 } },
      { rating: 1, _count: { _all: 2 } },
    ]);

    const result = await reviewService.getReviewSummary(PRODUCT_ID);

    expect(result).toEqual({
      averageRating: 4.5,
      totalReviews: 87,
      ratingDistribution: { 5: 50, 4: 25, 3: 8, 2: 2, 1: 2 },
    });
  });

  test("returns zeros when no reviews exist", async () => {
    mockActiveProduct();
    mockPrisma.review.aggregate.mockResolvedValue({
      _avg: { rating: null },
      _count: { rating: 0 },
    });
    mockPrisma.review.groupBy.mockResolvedValue([]);

    const result = await reviewService.getReviewSummary(PRODUCT_ID);

    expect(result).toEqual({
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  });

  test("rejects non-existent product", async () => {
    mockMissingProduct();

    await expect(
      reviewService.getReviewSummary(PRODUCT_ID),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Product not found",
    });
  });
});

describe("getReviewById", () => {
  test("returns a single review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue(makeReviewRow());

    const result = await reviewService.getReviewById(REVIEW_ID);

    expect(mockPrisma.review.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: REVIEW_ID } }),
    );
    expect(result.id).toBe(REVIEW_ID);
    expect(result.user.fullName).toBe("Jane Doe");
  });

  test("returns 404 for non-existent review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue(null);

    await expect(
      reviewService.getReviewById(REVIEW_ID),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Review not found",
    });
  });
});

describe("createReview", () => {
  test("creates a review successfully", async () => {
    mockActiveProduct();
    mockPrisma.review.findUnique.mockResolvedValue(null); // no existing review
    const created = makeReviewRow();
    mockPrisma.review.create.mockResolvedValue(created);

    const result = await reviewService.createReview(USER_ID, PRODUCT_ID, {
      rating: 5,
      comment: "The quality is amazing!",
      title: "Excellent product",
    });

    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: USER_ID,
          productId: PRODUCT_ID,
          rating: 5,
          comment: "The quality is amazing!",
          title: "Excellent product",
        },
      }),
    );
    expect(result.id).toBe(REVIEW_ID);
  });

  test("creates a review without optional title", async () => {
    mockActiveProduct();
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue(makeReviewRow({ title: null }));

    await reviewService.createReview(USER_ID, PRODUCT_ID, {
      rating: 4,
      comment: "Good product",
    });

    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: null }),
      }),
    );
  });

  test("rejects review for non-existent product", async () => {
    mockMissingProduct();

    await expect(
      reviewService.createReview(USER_ID, PRODUCT_ID, {
        rating: 5,
        comment: "Great!",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Product not found",
    });
    expect(mockPrisma.review.create).not.toHaveBeenCalled();
  });

  test("rejects review for inactive product", async () => {
    mockInactiveProduct();

    await expect(
      reviewService.createReview(USER_ID, PRODUCT_ID, {
        rating: 5,
        comment: "Great!",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Product not found",
    });
  });

  test("rejects duplicate review (app-level check)", async () => {
    mockActiveProduct();
    mockPrisma.review.findUnique.mockResolvedValue({ id: REVIEW_ID });

    await expect(
      reviewService.createReview(USER_ID, PRODUCT_ID, {
        rating: 4,
        comment: "Another review",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "You have already reviewed this product",
    });
    expect(mockPrisma.review.create).not.toHaveBeenCalled();
  });

  test("handles duplicate review race condition (P2002)", async () => {
    mockActiveProduct();
    mockPrisma.review.findUnique.mockResolvedValue(null);

    const p2002Error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "6.19.3", meta: { target: ["userId_productId"] } },
    );
    mockPrisma.review.create.mockRejectedValue(p2002Error);

    await expect(
      reviewService.createReview(USER_ID, PRODUCT_ID, {
        rating: 3,
        comment: "Race condition test",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "You have already reviewed this product",
    });
  });

  test("re-throws non-P2002 Prisma errors", async () => {
    mockActiveProduct();
    mockPrisma.review.findUnique.mockResolvedValue(null);

    const otherError = new Prisma.PrismaClientKnownRequestError(
      "Some other error",
      { code: "P2025", clientVersion: "6.19.3" },
    );
    mockPrisma.review.create.mockRejectedValue(otherError);

    await expect(
      reviewService.createReview(USER_ID, PRODUCT_ID, {
        rating: 3,
        comment: "Test",
      }),
    ).rejects.toThrow(otherError);
  });
});

describe("updateReview", () => {
  test("updates own review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: USER_ID,
    });
    const updated = makeReviewRow({ rating: 4, comment: "Updated text" });
    mockPrisma.review.update.mockResolvedValue(updated);

    const result = await reviewService.updateReview(USER_ID, REVIEW_ID, {
      rating: 4,
      comment: "Updated text",
    });

    expect(mockPrisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: REVIEW_ID },
        data: { rating: 4, comment: "Updated text" },
      }),
    );
    expect(result.rating).toBe(4);
  });

  test("rejects updating non-existent review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue(null);

    await expect(
      reviewService.updateReview(USER_ID, REVIEW_ID, { rating: 3 }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Review not found",
    });
    expect(mockPrisma.review.update).not.toHaveBeenCalled();
  });

  test("rejects updating another user's review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: OTHER_USER_ID,
    });

    await expect(
      reviewService.updateReview(USER_ID, REVIEW_ID, { rating: 1 }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "You can only update your own review",
    });
    expect(mockPrisma.review.update).not.toHaveBeenCalled();
  });

  test("only sends provided fields to the database", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: USER_ID,
    });
    mockPrisma.review.update.mockResolvedValue(makeReviewRow());

    await reviewService.updateReview(USER_ID, REVIEW_ID, { rating: 3 });

    expect(mockPrisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { rating: 3 },
      }),
    );
  });

  test("supports comment-only update", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: USER_ID,
    });
    mockPrisma.review.update.mockResolvedValue(
      makeReviewRow({ comment: "New comment text" }),
    );

    const result = await reviewService.updateReview(USER_ID, REVIEW_ID, {
      comment: "New comment text",
    });

    expect(mockPrisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { comment: "New comment text" },
      }),
    );
    expect(result.comment).toBe("New comment text");
  });

  test("supports title-only update", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: USER_ID,
    });
    mockPrisma.review.update.mockResolvedValue(
      makeReviewRow({ title: "Updated Title" }),
    );

    const result = await reviewService.updateReview(USER_ID, REVIEW_ID, {
      title: "Updated Title",
    });

    expect(mockPrisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: "Updated Title" },
      }),
    );
    expect(result.title).toBe("Updated Title");
  });

  test("supports clearing title by setting to null", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: USER_ID,
    });
    mockPrisma.review.update.mockResolvedValue(
      makeReviewRow({ title: null }),
    );

    const result = await reviewService.updateReview(USER_ID, REVIEW_ID, {
      title: null,
    });

    expect(mockPrisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: null },
      }),
    );
    expect(result.title).toBeNull();
  });
});

describe("deleteReview", () => {
  test("deletes own review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: USER_ID,
    });
    mockPrisma.review.delete.mockResolvedValue({ id: REVIEW_ID });

    await reviewService.deleteReview(USER_ID, REVIEW_ID);

    expect(mockPrisma.review.delete).toHaveBeenCalledWith({
      where: { id: REVIEW_ID },
    });
  });

  test("rejects deleting non-existent review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue(null);

    await expect(
      reviewService.deleteReview(USER_ID, REVIEW_ID),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Review not found",
    });
    expect(mockPrisma.review.delete).not.toHaveBeenCalled();
  });

  test("rejects deleting another user's review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({
      id: REVIEW_ID,
      userId: OTHER_USER_ID,
    });

    await expect(
      reviewService.deleteReview(USER_ID, REVIEW_ID),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "You can only delete your own review",
    });
    expect(mockPrisma.review.delete).not.toHaveBeenCalled();
  });
});
