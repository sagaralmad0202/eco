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
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
    images: [
      {
        url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
        alt: "Leather Tote Bag Front",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
        alt: "Leather Tote Bag Side",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
        alt: "Leather Tote Bag Interior",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800",
        alt: "Leather Tote Bag Detail",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800",
        alt: "Leather Tote Bag Styled",
        position: 4,
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
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
        alt: "Silk Midi Dress Main",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800",
        alt: "Silk Midi Dress Angle",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800",
        alt: "Silk Midi Dress Back",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800",
        alt: "Silk Midi Dress Texture",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800",
        alt: "Silk Midi Dress Model",
        position: 4,
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
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
        alt: "Denim Jacket Front",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
        alt: "Denim Jacket Back",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800",
        alt: "Denim Jacket Pocket Detail",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800",
        alt: "Denim Jacket Collar",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800",
        alt: "Denim Jacket Outdoor",
        position: 4,
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
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
    images: [
      {
        url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
        alt: "Cashmere Sweater Main",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        alt: "Cashmere Sweater Angle",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1608234807905-4466023792f5?w=800",
        alt: "Cashmere Sweater Fabric",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800",
        alt: "Cashmere Sweater Model Front",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
        alt: "Cashmere Sweater Model Side",
        position: 4,
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
    mainImage: "/media/products/linen-blazer.webp",
    images: [
      {
        url: "/media/products/linen-blazer.webp",
        alt: "Linen Blazer Front",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
        alt: "Linen Blazer Lapel",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800",
        alt: "Linen Blazer Sleeve",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800",
        alt: "Linen Blazer Back",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800",
        alt: "Linen Blazer Styled",
        position: 4,
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
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800",
    images: [
      {
        url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800",
        alt: "Velvet Skirt Main",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
        alt: "Velvet Skirt Flow",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1551803091-e20673f15770?w=800",
        alt: "Velvet Skirt Waistband",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800",
        alt: "Velvet Skirt Detail",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
        alt: "Velvet Skirt Full Length",
        position: 4,
      },
    ],
    variants: [
      { sku: "VVT-RED-S", title: "Wine Red / S", price: "55.00", stock: 20 },
      { sku: "VVT-RED-M", title: "Wine Red / M", price: "55.00", stock: 25 },
      { sku: "VVT-RED-L", title: "Wine Red / L", price: "55.00", stock: 15 },
    ],
  },
  {
    name: "Sunrise On The Red Sand Dunes",
    slug: "sunrise-on-the-red-sand-dunes",
    description:
      "Captivating oriental fragrance with top notes of orange blossom, amber, and warm spice.",
    brand: "Zara",
    categorySlug: "beauty",
    categoryName: "Beauty",
    price: "180.00",
    isFeatured: true,
    mainImage:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
        alt: "Sunrise Fragrance Bottle",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800",
        alt: "Sunrise Fragrance Spray",
        position: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        alt: "Sunrise Fragrance Packaging",
        position: 2,
      },
      {
        url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800",
        alt: "Sunrise Fragrance Cap",
        position: 3,
      },
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
        alt: "Sunrise Fragrance Lifestyle",
        position: 4,
      },
    ],
    variants: [
      { sku: "SRD-EDP-100", title: "100ml / EDP", price: "180.00", stock: 30 },
    ],
  },
  {
    name: "Zara Lisboa & Seoul",
    slug: "zara-lisboa-seoul",
    description:
      "Fresh aromatic twin eau de toilette set featuring woody citrus notes.",
    brand: "Zara",
    categorySlug: "beauty",
    categoryName: "Beauty",
    price: "45.00",
    isFeatured: true,
    mainImage:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
        alt: "Zara Lisboa Main",
        position: 0,
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
  ];

  for (const cat of categoryNames) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log("  Categories seeded: Women, Men, Jackets, Bags, Beauty");

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
