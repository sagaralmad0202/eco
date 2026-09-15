require("dotenv").config();
const prisma = require("../src/lib/prisma");

const PRODUCTS_TO_UPDATE = [
  {
    targetSlugs: ["wool-trench-coat", "sunrise-on-the-red-sand-dunes"],
    name: "Sunrise On The Red Sand Dunes",
    slug: "sunrise-on-the-red-sand-dunes",
    description: "A warm and spicy eau de parfum blending ginger, mandarin, and amber notes for an intoxicating scent trail.",
    brand: "Zara",
    price: "180.00",
    categorySlug: "fragrance",
    categoryName: "Fragrance",
    isFeatured: true,
  },
  {
    targetSlugs: ["cotton-shirt", "zara-lisboa-seoul"],
    name: "Zara Lisboa & Seoul",
    slug: "zara-lisboa-seoul",
    description: "A fresh, citrusy, and vibrant eau de toilette set featuring energizing citrus, floral water, and cedar wood.",
    brand: "Zara",
    price: "45.00",
    categorySlug: "fragrance",
    categoryName: "Fragrance",
    isFeatured: true,
  },
];

const REVIEWS_DATA = [
  {
    slug: "cashmere-sweater",
    reviews: [
      { rating: 5, title: "Unbelievably soft", comment: "The quality of the cashmere is top tier. Fits true to size and feels incredible." },
      { rating: 5, title: "Favorite winter purchase", comment: "Super warm yet lightweight. Highly recommended!" },
      { rating: 4, title: "Great sweater", comment: "Very luxurious material. Cream color is versatile." },
    ],
  },
  {
    slug: "linen-blazer",
    reviews: [
      { rating: 5, title: "Crisp and breathable", comment: "Perfect for warm weather. Tailored fit is great." },
      { rating: 4, title: "Stylish summer jacket", comment: "Lightweight and comfortable. Neutral beige goes with everything." },
    ],
  },
  {
    slug: "velvet-skirt",
    reviews: [
      { rating: 4, title: "Rich color and feel", comment: "The wine red is gorgeous in person. Nice drape." },
      { rating: 5, title: "Flattering fit", comment: "Comfortable waistband and elegant flow." },
    ],
  },
  {
    slug: "sunrise-on-the-red-sand-dunes",
    reviews: [
      { rating: 5, title: "Incredible fragrance", comment: "Smells like luxury. Amazing projection and lasts 8+ hours on skin." },
      { rating: 5, title: "Signature scent", comment: "Compliments every time I wear it. Fresh ginger and amber perfection." },
      { rating: 4, title: "Great longevity", comment: "Unique and sophisticated scent profile." },
    ],
  },
  {
    slug: "denim-jacket",
    reviews: [
      { rating: 4, title: "Classic wardrobe staple", comment: "Durable denim and vintage wash look great." },
      { rating: 5, title: "Perfect layering piece", comment: "Great fit through the shoulders and arms." },
    ],
  },
  {
    slug: "silk-midi-dress",
    reviews: [
      { rating: 5, title: "Stunning silk finish", comment: "Wore this to an evening event and received so many compliments." },
      { rating: 4, title: "Beautiful drape", comment: "The emerald green color is vibrant and rich." },
    ],
  },
  {
    slug: "leather-tote-bag",
    reviews: [
      { rating: 5, title: "Spacious and durable", comment: "Holds my laptop and daily essentials comfortably. Genuine leather feels premium." },
      { rating: 4, title: "Excellent craftsmanship", comment: "Stitching and hardware are high quality." },
    ],
  },
  {
    slug: "zara-lisboa-seoul",
    reviews: [
      { rating: 4, title: "Fresh daily fragrance", comment: "Very clean and refreshing for everyday wear." },
      { rating: 4, title: "Great value", comment: "Good scent and value for the price point." },
    ],
  },
];

async function update() {
  console.log("Starting product and review update...");

  // 1. Ensure category exists
  let fragranceCat = await prisma.category.findUnique({ where: { slug: "fragrance" } });
  if (!fragranceCat) {
    fragranceCat = await prisma.category.create({
      data: { name: "Fragrance", slug: "fragrance" },
    });
  }

  // 2. Update products
  for (const item of PRODUCTS_TO_UPDATE) {
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: { in: item.targetSlugs } },
          { name: item.name },
        ],
      },
      include: { variants: true },
    });

    if (existing) {
      console.log(`Updating product [${existing.name}] -> [${item.name}] (${item.slug})...`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          brand: item.brand,
          categoryId: fragranceCat.id,
          isFeatured: item.isFeatured,
        },
      });

      if (existing.variants.length > 0) {
        await prisma.productVariant.updateMany({
          where: { productId: existing.id },
          data: { price: item.price },
        });
      }
    }
  }

  // 3. Get users to associate reviews with
  const users = await prisma.user.findMany({ take: 10 });
  if (users.length === 0) {
    console.log("No users found to attach reviews.");
    return;
  }

  // 4. Seed reviews
  for (const revItem of REVIEWS_DATA) {
    const product = await prisma.product.findUnique({
      where: { slug: revItem.slug },
    });

    if (!product) {
      console.log(`Product with slug ${revItem.slug} not found for review seeding.`);
      continue;
    }

    for (let i = 0; i < revItem.reviews.length; i++) {
      const rev = revItem.reviews[i];
      const user = users[i % users.length];

      await prisma.review.upsert({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
        update: {
          rating: rev.rating,
          title: rev.title,
          comment: rev.comment,
        },
        create: {
          userId: user.id,
          productId: product.id,
          rating: rev.rating,
          title: rev.title,
          comment: rev.comment,
        },
      });
    }
    console.log(`Reviews seeded for ${revItem.slug}.`);
  }

  console.log("Finished updating products and reviews.");
}

update()
  .catch((err) => {
    console.error("Update failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
