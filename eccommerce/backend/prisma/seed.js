// Seed script — populates database with real e-commerce products & 5 gallery images per product
// Run with: npm run db:seed

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const PRODUCTS_DATA = [
  {
    name: "Leather Tote Bag",
    slug: "leather-tote-bag",
    description:
      "Premium handcrafted leather tote bag with spacious interior compartment.",
    brand: "Ciseco",
    categorySlug: "bags",
    categoryName: "Bags",
    price: "85.00",
    isFeatured: true,
    mainImage:
      "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp",
        alt: "Leather Tote Bag Front",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1-2.webp",
        alt: "Leather Tote Bag Side",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1-3.webp",
        alt: "Leather Tote Bag Detail",
        position: 2,
      },
    ],
    variants: [
      {
        sku: "LTB-PNK-STD",
        title: "Pink Yarrow / One Size",
        price: "85.00",
        stock: 25,
      },
      {
        sku: "LTB-BLK-STD",
        title: "Black / One Size",
        price: "85.00",
        stock: 15,
      },
    ],
  },
  {
    name: "Silk Midi Dress",
    slug: "silk-midi-dress",
    description:
      "Elegant silk midi dress featuring an asymmetrical neckline and side slit.",
    brand: "Ciseco",
    categorySlug: "women",
    categoryName: "Women",
    price: "120.00",
    isFeatured: true,
    mainImage:
      "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp",
        alt: "Silk Midi Dress Main",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2-1.webp",
        alt: "Silk Midi Dress Angle",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2-2.webp",
        alt: "Silk Midi Dress Back",
        position: 2,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2-3.webp",
        alt: "Silk Midi Dress Texture",
        position: 3,
      },
    ],
    variants: [
      {
        sku: "SMD-GRN-S",
        title: "Emerald Green / S",
        price: "120.00",
        stock: 10,
      },
      {
        sku: "SMD-GRN-M",
        title: "Emerald Green / M",
        price: "120.00",
        stock: 12,
      },
      {
        sku: "SMD-GRN-L",
        title: "Emerald Green / L",
        price: "120.00",
        stock: 8,
      },
    ],
  },
  {
    name: "Denim Jacket",
    slug: "denim-jacket",
    description:
      "Classic washed indigo denim jacket with chest flap pockets and brass buttons.",
    brand: "Ciseco",
    categorySlug: "jackets",
    categoryName: "Jackets",
    price: "65.00",
    isFeatured: true,
    mainImage:
      "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3.webp",
        alt: "Denim Jacket Front",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3-1.webp",
        alt: "Denim Jacket Back",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3-2.webp",
        alt: "Denim Jacket Pocket Detail",
        position: 2,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3-3.webp",
        alt: "Denim Jacket Collar",
        position: 3,
      },
    ],
    variants: [
      { sku: "DNM-BLU-S", title: "Light Blue / S", price: "65.00", stock: 15 },
      { sku: "DNM-BLU-M", title: "Light Blue / M", price: "65.00", stock: 20 },
      { sku: "DNM-BLU-L", title: "Light Blue / L", price: "65.00", stock: 18 },
    ],
  },
  {
    name: "Cashmere Sweater",
    slug: "cashmere-sweater",
    description:
      "Ultra-soft 100% Mongolian cashmere crewneck sweater with ribbed cuffs.",
    brand: "Ciseco",
    categorySlug: "men",
    categoryName: "Men",
    price: "150.00",
    isFeatured: true,
    mainImage:
      "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4.webp",
        alt: "Cashmere Sweater Main",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4-2.webp",
        alt: "Cashmere Sweater Angle",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4-3.webp",
        alt: "Cashmere Sweater Fabric",
        position: 2,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4-4.webp",
        alt: "Cashmere Sweater Model Front",
        position: 3,
      },
    ],
    variants: [
      { sku: "CSM-CRM-S", title: "Cream / S", price: "150.00", stock: 14 },
      { sku: "CSM-CRM-M", title: "Cream / M", price: "150.00", stock: 18 },
      { sku: "CSM-CRM-L", title: "Cream / L", price: "150.00", stock: 10 },
      { sku: "CSM-CRM-XL", title: "Cream / XL", price: "150.00", stock: 6 },
    ],
  },
  {
    name: "Linen Blazer",
    slug: "linen-blazer",
    description:
      "Lightweight breathable linen blazer tailored for summer sophistication.",
    brand: "Ciseco",
    categorySlug: "men",
    categoryName: "Men",
    price: "95.00",
    isFeatured: true,
    mainImage:
      "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5.webp",
        alt: "Linen Blazer Front",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5-1.webp",
        alt: "Linen Blazer Lapel",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5-2.webp",
        alt: "Linen Blazer Sleeve",
        position: 2,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5-3.webp",
        alt: "Linen Blazer Back",
        position: 3,
      },
    ],
    variants: [
      { sku: "LNB-BGE-S", title: "Beige / S", price: "95.00", stock: 12 },
      { sku: "LNB-BGE-M", title: "Beige / M", price: "95.00", stock: 16 },
      { sku: "LNB-BGE-L", title: "Beige / L", price: "95.00", stock: 14 },
    ],
  },
  {
    name: "Velvet Skirt",
    slug: "velvet-skirt",
    description: "Luxe high-waisted velvet midi skirt in rich jewel tones.",
    brand: "Ciseco",
    categorySlug: "women",
    categoryName: "Women",
    price: "55.00",
    isFeatured: true,
    mainImage:
      "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6.webp",
        alt: "Velvet Skirt Main",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6-1.webp",
        alt: "Velvet Skirt Flow",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6-2.webp",
        alt: "Velvet Skirt Waistband",
        position: 2,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6-3.webp",
        alt: "Velvet Skirt Detail",
        position: 3,
      },
    ],
    variants: [
      { sku: "VVT-RED-S", title: "Wine Red / S", price: "55.00", stock: 20 },
      { sku: "VVT-RED-M", title: "Wine Red / M", price: "55.00", stock: 25 },
      { sku: "VVT-RED-L", title: "Wine Red / L", price: "55.00", stock: 15 },
    ],
  },
  {
    name: "Wool Trench Coat",
    slug: "wool-trench-coat",
    description:
      "Timeless wool-blend trench coat in camel with double-breasted button closure and belted waist.",
    brand: "Ciseco",
    categorySlug: "jackets",
    categoryName: "Jackets",
    price: "180.00",
    isFeatured: true,
    mainImage: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7.webp",
        alt: "Wool Trench Coat Front",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7-1.webp",
        alt: "Wool Trench Coat Angle",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7-2.webp",
        alt: "Wool Trench Coat Detail",
        position: 2,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7-3.webp",
        alt: "Wool Trench Coat Back",
        position: 3,
      },
    ],
    variants: [
      { sku: "WTC-CML-S", title: "Camel / S", price: "180.00", stock: 15 },
      { sku: "WTC-CML-M", title: "Camel / M", price: "180.00", stock: 20 },
      { sku: "WTC-CML-L", title: "Camel / L", price: "180.00", stock: 12 },
    ],
  },
  {
    name: "Cotton Shirt",
    slug: "cotton-shirt",
    description:
      "Crisp, lightweight 100% organic cotton shirt featuring a relaxed collar and tailored fit.",
    brand: "Ciseco",
    categorySlug: "men",
    categoryName: "Men",
    price: "45.00",
    isFeatured: true,
    mainImage: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8.webp",
    images: [
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8.webp",
        alt: "Cotton Shirt Front",
        position: 0,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8-1.webp",
        alt: "Cotton Shirt Collar",
        position: 1,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8-2.webp",
        alt: "Cotton Shirt Fabric",
        position: 2,
      },
      {
        url: "https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8-3.webp",
        alt: "Cotton Shirt Model",
        position: 3,
      },
    ],
    variants: [
      { sku: "CTS-WHT-S", title: "White / S", price: "45.00", stock: 25 },
      { sku: "CTS-WHT-M", title: "White / M", price: "45.00", stock: 30 },
      { sku: "CTS-WHT-L", title: "White / L", price: "45.00", stock: 20 },
    ],
  },
      {
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800",
        alt: "Zara Lisboa Twin Pack",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800",
        alt: "Zara Lisboa Bottle Detail",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800",
        alt: "Zara Lisboa Box",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
        alt: "Zara Lisboa Display",
        position: 4,
      },
    ],
    variants: [
      { sku: "ZLS-EDT-100", title: "100ml / EDT", price: "45.00", stock: 40 },
    ],
  },
];

async function main() {
  console.log(
    "Seeding database with products and 5 gallery images per product...",
  );

  // ---------- Admin User ----------
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
  console.log(`  Admin user: ${admin.email}`);

  // ---------- Categories ----------
  const categoryMap = {};
  const categoryNames = [
    { name: "Women", slug: "women" },
    { name: "Men", slug: "men" },
    { name: "Jackets", slug: "jackets" },
    { name: "Bags", slug: "bags" },
    { name: "Beauty", slug: "beauty" },
    { name: "Fragrance", slug: "fragrance" },
  ];

  for (const cat of categoryNames) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log("  Categories seeded: Women, Men, Jackets, Bags, Beauty, Fragrance");

  // ---------- Products, Images & Variants ----------
  for (const p of PRODUCTS_DATA) {
    const categoryId = categoryMap[p.categorySlug] || null;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        brand: p.brand,
        image: p.mainImage,
        isFeatured: p.isFeatured,
        ...(categoryId ? { categoryId } : {}),
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand,
        image: p.mainImage,
        isFeatured: p.isFeatured,
        ...(categoryId ? { categoryId } : {}),
      },
    });

    // Seed 5 gallery images
    for (const img of p.images) {
      const existingImg = await prisma.productImage.findFirst({
        where: { productId: product.id, position: img.position },
      });
      if (existingImg) {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { url: img.url, alt: img.alt },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: img.url,
            alt: img.alt,
            position: img.position,
          },
        });
      }
    }

    // Seed variants
    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          price: v.price,
          stock: v.stock,
          title: v.title,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          title: v.title,
          price: v.price,
          stock: v.stock,
        },
      });
    }

    console.log(
      `  Seeded product: ${product.name} (image set + 5 gallery images + ${p.variants.length} variants)`,
    );
  }

  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
