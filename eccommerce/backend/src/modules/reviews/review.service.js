const { Prisma } = require("@prisma/client");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

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

async function getReviewSummary(slugOrId) {
  const product = await findProduct(slugOrId);
  const productId = product.id;

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
    select: { id: true, userId: true },
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

  return updated;
}

// ---- Delete review ----

async function deleteReview(userId, reviewId) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true },
  });

  if (!review) {
    throw ApiError.notFound("Review not found");
  }

  if (review.userId !== userId) {
    throw ApiError.forbidden("You can only delete your own review");
  }

  // Hard delete — the project has no soft-delete convention anywhere.
  await prisma.review.delete({ where: { id: reviewId } });
}

module.exports = {
  getProductReviews,
  getReviewSummary,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
