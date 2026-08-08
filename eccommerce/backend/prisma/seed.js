// Seed script — fills the database with sample data so you can test
// immediately instead of staring at empty tables.
//
// Run with:  npm run db:seed
//
// Safe to run more than once: every write uses upsert, so re-running
// updates existing rows rather than creating duplicates.

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------- Admin user ----------
  const adminPassword = await bcrypt.hash("Admin@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shop.local" },
    update: {},
    create: {
      email: "admin@shop.local",
      passwordHash: adminPassword,
      fullName: "Store Admin",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`  admin user: ${admin.email}  (password: Admin@12345)`);

  // ---------- Categories ----------
  const men = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: { name: "Men", slug: "men" },
  });

  const footwear = await prisma.category.upsert({
    where: { slug: "mens-footwear" },
    update: {},
    create: { name: "Footwear", slug: "mens-footwear", parentId: men.id },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });
  console.log("  categories: Men > Footwear, Electronics");

  // ---------- Product 1: shoes with size variants ----------
  const shoe = await prisma.product.upsert({
    where: { slug: "runner-pro-shoes" },
    update: {},
    create: {
      name: "Runner Pro Shoes",
      slug: "runner-pro-shoes",
      description: "Lightweight everyday running shoes with cushioned sole.",
      brand: "Strive",
      categoryId: footwear.id,
      images: {
        create: [
          { url: "https://placehold.co/600x600?text=Runner+Pro", alt: "Runner Pro Shoes", position: 0 },
        ],
      },
    },
  });

  const shoeVariants = [
    { sku: "RPS-BLU-8", title: "Blue / UK 8", price: "2999.00", compareAtPrice: "3999.00", stock: 12 },
    { sku: "RPS-BLU-9", title: "Blue / UK 9", price: "2999.00", compareAtPrice: "3999.00", stock: 8 },
    { sku: "RPS-BLK-9", title: "Black / UK 9", price: "3199.00", compareAtPrice: "3999.00", stock: 0 },
  ];

  for (const v of shoeVariants) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { ...v, productId: shoe.id },
    });
  }
  console.log("  product: Runner Pro Shoes (3 variants, one out of stock)");

  // ---------- Product 2: single-variant electronics ----------
  const buds = await prisma.product.upsert({
    where: { slug: "sonic-wireless-earbuds" },
    update: {},
    create: {
      name: "Sonic Wireless Earbuds",
      slug: "sonic-wireless-earbuds",
      description: "Bluetooth 5.3 earbuds with 30-hour case battery.",
      brand: "Sonic",
      categoryId: electronics.id,
      images: {
        create: [
          { url: "https://placehold.co/600x600?text=Earbuds", alt: "Sonic Wireless Earbuds", position: 0 },
        ],
      },
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: "SWE-WHT-STD" },
    update: {},
    create: {
      productId: buds.id,
      sku: "SWE-WHT-STD",
      title: "White",
      price: "1499.00",
      compareAtPrice: "2499.00",
      stock: 40,
    },
  });
  console.log("  product: Sonic Wireless Earbuds (1 variant)");

  // ---------- Coupons ----------
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENT",
      value: "10.00",
      minOrderTotal: "999.00",
      maxDiscount: "500.00", // caps the percentage
      usageLimit: 1000,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT200" },
    update: {},
    create: {
      code: "FLAT200",
      discountType: "FIXED",
      value: "200.00",
      minOrderTotal: "1500.00",
      usageLimit: 500,
    },
  });
  console.log("  coupons: WELCOME10, FLAT200");

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
