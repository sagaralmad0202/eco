const {
  createReviewSchema,
  updateReviewSchema,
  listReviewsQuerySchema,
  productIdParamSchema,
  reviewIdParamSchema,
} = require("../src/modules/reviews/review.validators");

describe("createReviewSchema", () => {
  test("accepts valid review", () => {
    const result = createReviewSchema.safeParse({
      rating: 5,
      comment: "Great product!",
      title: "Love it",
    });
    expect(result.success).toBe(true);
    expect(result.data.rating).toBe(5);
    expect(result.data.comment).toBe("Great product!");
    expect(result.data.title).toBe("Love it");
  });

  test("accepts review without title", () => {
    const result = createReviewSchema.safeParse({
      rating: 3,
      comment: "Decent product",
    });
    expect(result.success).toBe(true);
    expect(result.data.title).toBeUndefined();
  });

  test("rejects rating 0", () => {
    const result = createReviewSchema.safeParse({
      rating: 0,
      comment: "Bad",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Rating must be between 1 and 5",
    );
  });

  test("rejects rating 6", () => {
    const result = createReviewSchema.safeParse({
      rating: 6,
      comment: "Too good!",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Rating must be between 1 and 5",
    );
  });

  test("rejects non-integer rating", () => {
    const result = createReviewSchema.safeParse({
      rating: 3.5,
      comment: "Half star",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Rating must be a whole number",
    );
  });

  test("rejects missing rating", () => {
    const result = createReviewSchema.safeParse({
      comment: "No rating",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty comment", () => {
    const result = createReviewSchema.safeParse({
      rating: 4,
      comment: "",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Review comment cannot be empty",
    );
  });

  test("rejects whitespace-only comment", () => {
    const result = createReviewSchema.safeParse({
      rating: 4,
      comment: "   ",
    });
    expect(result.success).toBe(false);
    // After trim, the string is empty, so min(1) rejects it.
    expect(result.error.issues[0].message).toBe(
      "Review comment cannot be empty",
    );
  });

  test("rejects missing comment", () => {
    const result = createReviewSchema.safeParse({
      rating: 4,
    });
    expect(result.success).toBe(false);
  });

  test("rejects comment over 2000 characters", () => {
    const result = createReviewSchema.safeParse({
      rating: 3,
      comment: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Review comment must be 2000 characters or fewer",
    );
  });

  test("accepts comment at exactly 2000 characters", () => {
    const result = createReviewSchema.safeParse({
      rating: 3,
      comment: "a".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  test("rejects title over 200 characters", () => {
    const result = createReviewSchema.safeParse({
      rating: 3,
      comment: "Fine",
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "Title must be 200 characters or fewer",
    );
  });

  test("trims whitespace from comment and title", () => {
    const result = createReviewSchema.safeParse({
      rating: 4,
      comment: "  Nice product  ",
      title: "  Good  ",
    });
    expect(result.success).toBe(true);
    expect(result.data.comment).toBe("Nice product");
    expect(result.data.title).toBe("Good");
  });
});

describe("updateReviewSchema", () => {
  test("accepts partial update with rating only", () => {
    const result = updateReviewSchema.safeParse({ rating: 4 });
    expect(result.success).toBe(true);
  });

  test("accepts partial update with comment only", () => {
    const result = updateReviewSchema.safeParse({ comment: "Updated text" });
    expect(result.success).toBe(true);
  });

  test("accepts partial update with title only", () => {
    const result = updateReviewSchema.safeParse({ title: "New title" });
    expect(result.success).toBe(true);
  });

  test("accepts null title (to clear it)", () => {
    const result = updateReviewSchema.safeParse({ title: null });
    expect(result.success).toBe(true);
    expect(result.data.title).toBeNull();
  });

  test("rejects empty body", () => {
    const result = updateReviewSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "At least one field (rating, comment, or title) is required",
    );
  });

  test("validates rating range on update", () => {
    const result = updateReviewSchema.safeParse({ rating: 0 });
    expect(result.success).toBe(false);
  });

  test("validates comment length on update", () => {
    const result = updateReviewSchema.safeParse({
      comment: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("listReviewsQuerySchema", () => {
  test("applies defaults for page, limit, sort", () => {
    const result = listReviewsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      page: 1,
      limit: 10,
      sort: "newest",
    });
  });

  test("coerces string numbers", () => {
    const result = listReviewsQuerySchema.safeParse({
      page: "2",
      limit: "20",
    });
    expect(result.success).toBe(true);
    expect(result.data.page).toBe(2);
    expect(result.data.limit).toBe(20);
  });

  test("accepts valid sort options", () => {
    for (const sort of [
      "newest",
      "oldest",
      "highest_rating",
      "lowest_rating",
    ]) {
      const result = listReviewsQuerySchema.safeParse({ sort });
      expect(result.success).toBe(true);
    }
  });

  test("rejects invalid sort", () => {
    const result = listReviewsQuerySchema.safeParse({ sort: "random" });
    expect(result.success).toBe(false);
  });

  test("rejects limit over 50", () => {
    const result = listReviewsQuerySchema.safeParse({ limit: "51" });
    expect(result.success).toBe(false);
  });

  test("rejects page 0", () => {
    const result = listReviewsQuerySchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  test("accepts optional rating filter", () => {
    const result = listReviewsQuerySchema.safeParse({ rating: "5" });
    expect(result.success).toBe(true);
    expect(result.data.rating).toBe(5);
  });

  test("rejects rating filter outside 1-5", () => {
    expect(
      listReviewsQuerySchema.safeParse({ rating: "0" }).success,
    ).toBe(false);
    expect(
      listReviewsQuerySchema.safeParse({ rating: "6" }).success,
    ).toBe(false);
  });
});

describe("productIdParamSchema", () => {
  test("accepts valid UUID", () => {
    const result = productIdParamSchema.safeParse({
      productId: "11111111-aaaa-bbbb-cccc-dddddddddddd",
    });
    expect(result.success).toBe(true);
  });

  test("accepts valid slug identifier", () => {
    const result = productIdParamSchema.safeParse({
      productId: "sunrise-on-the-red-sand-dunes",
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty product identifier", () => {
    const result = productIdParamSchema.safeParse({ productId: "   " });
    expect(result.success).toBe(false);
  });
});

describe("reviewIdParamSchema", () => {
  test("accepts valid UUID", () => {
    const result = reviewIdParamSchema.safeParse({
      reviewId: "22222222-aaaa-bbbb-cccc-dddddddddddd",
    });
    expect(result.success).toBe(true);
  });

  test("rejects non-UUID", () => {
    const result = reviewIdParamSchema.safeParse({ reviewId: "bad" });
    expect(result.success).toBe(false);
  });
});
