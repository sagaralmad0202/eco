const { Prisma } = require("@prisma/client");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const { wrap, del, delPattern, cacheKeys, CACHE_TTL } = require("../../lib/cache");

// Only the fields safe to expose publicly. Never leak passwordHash, tokens,
// email, or internal flags.
const publicUserSelect = {
  id: true,
  fullName: true,
  avatarUrl: true,
};

// ---- Sort mapping ----

const SORT_MAP = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  highest_rating: { rating: "desc" },
  lowest_rating: { rating: "asc" },
};

// ---- Helper: Resolve product by UUID or slug ----

async function findProduct(slugOrId) {
  const isUuid =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      slugOrId,
    );
  const where = isUuid ? { id: slugOrId } : { slug: slugOrId };

  const product = await prisma.product.findUnique({
    where,
    select: { id: true, isActive: true },
  });

  if (!product || !product.isActive) {
    throw ApiError.notFound("Product not found");
  }

  return product;
}

// ---- List reviews for a product (paginated) ----

async function getProductReviews(slugOrId, query) {
  const { page, limit, sort, rating } = query;

  // Verify the product exists and is active, and obtain its actual UUID.
  const product = await findProduct(slugOrId);
  const productId = product.id;

  const where = { productId };
  if (rating !== undefined) {
    where.rating = rating;
  }

  const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: { select: publicUserSelect },
      },
    }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

// ---- Review summary (aggregate) ----

async function fetchReviewSummaryFromDb(productId) {
  // Two database queries, both efficient — no full table scan.
  const [aggregate, distribution] = await Promise.all([
    prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { _all: true },
    }),
  ]);

  // Build the distribution map with all 5 ratings represented.
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const row of distribution) {
    ratingDistribution[row.rating] = row._count._all;
  }

  return {
    averageRating: aggregate._avg.rating
      ? Number(aggregate._avg.rating.toFixed(2))
      : 0,
    totalReviews: aggregate._count.rating,
    ratingDistribution,
  };
}

async function getReviewSummary(slugOrId) {
  const product = await findProduct(slugOrId);
  const productId = product.id;
  const cacheKey = cacheKeys.reviewSummary(productId);

  return wrap(cacheKey, CACHE_TTL.REVIEW_SUMMARY, () =>
    fetchReviewSummaryFromDb(productId),
  );
}

// Invalidate caches dependent on review data (review summary, product detail, and listings)
async function invalidateReviewCaches(productId) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    const tasks = [
      del(cacheKeys.reviewSummary(productId)),
      delPattern(cacheKeys.allProductListsPattern()),
    ];

    if (product) {
      tasks.push(del(cacheKeys.productById(product.id)));
      if (product.slug) {
        tasks.push(del(cacheKeys.productBySlug(product.slug)));
      }
    }

    await Promise.allSettled(tasks);
  } catch {
    // Non-fatal cache invalidation failure
  }
}

// ---- Get single review ----

async function getReviewById(reviewId) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      productId: true,
      user: { select: publicUserSelect },
    },
  });

  if (!review) {
    throw ApiError.notFound("Review not found");
  }

  return review;
}

// ---- Create review ----

async function createReview(userId, slugOrId, data) {
  const product = await findProduct(slugOrId);
  const productId = product.id;

  // Friendly duplicate check before hitting the database constraint.
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (existing) {
    throw ApiError.conflict("You have already reviewed this product");
  }

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: data.rating,
        comment: data.comment,
        title: data.title || null,
      },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        productId: true,
        user: { select: publicUserSelect },
      },
    });

    // Invalidate affected caches after authoritative DB write
    invalidateReviewCaches(productId).catch(() => {});

    return review;
  } catch (err) {
    // Race condition: two simultaneous requests passed the app-level check.
    // The database unique constraint catches the second one.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw ApiError.conflict("You have already reviewed this product");
    }
    throw err;
  }
}

// ---- Update review ----

async function updateReview(userId, reviewId, data) {
  // Find review with ownership baked into the WHERE clause — no separate
  // "fetch then check" that leaves a TOCTOU window.
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, productId: true },
  });

  if (!review) {
    throw ApiError.notFound("Review not found");
  }

  if (review.userId !== userId) {
    throw ApiError.forbidden("You can only update your own review");
  }

  const updateData = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.comment !== undefined) updateData.comment = data.comment;
  if (data.title !== undefined) updateData.title = data.title;

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      productId: true,
      user: { select: publicUserSelect },
    },
  });

  // Invalidate affected caches after authoritative DB write
  invalidateReviewCaches(review.productId).catch(() => {});

  return updated;
}

// ---- Delete review ----

async function deleteReview(userId, reviewId) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, productId: true },
  });

  if (!review) {
    throw ApiError.notFound("Review not found");
  }

  if (review.userId !== userId) {
    throw ApiError.forbidden("You can only delete your own review");
  }

  // Hard delete — the project has no soft-delete convention anywhere.
  await prisma.review.delete({ where: { id: reviewId } });

  // Invalidate affected caches after authoritative DB write
  invalidateReviewCaches(review.productId).catch(() => {});
}

module.exports = {
  getProductReviews,
  getReviewSummary,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
