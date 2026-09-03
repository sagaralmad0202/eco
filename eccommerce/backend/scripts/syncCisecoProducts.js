require("dotenv").config();
const fs = require("fs");
const path = require("path");
const prisma = require("../src/lib/prisma");
const { uploadObject, objectExists, getPublicUrl } = require("../src/lib/storage");
const env = require("../src/config/env");

const CISECO_PRODUCTS = [
  {
    name: "Leather Tote Bag",
    slug: "leather-tote-bag",
    oldSlugs: ["leather-tote-bag"],
    price: "85.00",
    color: "Pink Yarrow",
    rating: 4.5,
    reviewCount: 87,
    mainImage: "products/p1.webp",
    gallery: [
      "products/p1.webp",
      "products/p1-2.webp",
      "products/p1-3.webp",
    ],
  },
  {
    name: "Silk Midi Dress",
    slug: "silk-midi-dress",
    oldSlugs: ["silk-midi-dress"],
    price: "120.00",
    color: "Emerald Green",
    rating: 4.7,
    reviewCount: 95,
    mainImage: "products/p2.webp",
    gallery: [
      "products/p2.webp",
      "products/p2-1.webp",
      "products/p2-2.webp",
      "products/p2-3.webp",
    ],
  },
  {
    name: "Denim Jacket",
    slug: "denim-jacket",
    oldSlugs: ["denim-jacket"],
    price: "65.00",
    color: "Light Blue",
    rating: 4.3,
    reviewCount: 120,
    mainImage: "products/p3.webp",
    gallery: [
      "products/p3.webp",
      "products/p3-1.webp",
      "products/p3-2.webp",
      "products/p3-3.webp",
    ],
  },
  {
    name: "Cashmere Sweater",
    slug: "cashmere-sweater",
    oldSlugs: ["cashmere-sweater"],
    price: "150.00",
    color: "Cream",
    rating: 4.8,
    reviewCount: 75,
    mainImage: "products/p4.webp",
    gallery: [
      "products/p4.webp",
      "products/p4-2.webp",
      "products/p4-3.webp",
      "products/p4-4.webp",
    ],
  },
  {
    name: "Linen Blazer",
    slug: "linen-blazer",
    oldSlugs: ["linen-blazer"],
    price: "95.00",
    color: "Beige",
    rating: 4.4,
    reviewCount: 60,
    mainImage: "products/p5.webp",
    gallery: [
      "products/p5.webp",
      "products/p5-1.webp",
      "products/p5-2.webp",
      "products/p5-3.webp",
    ],
  },
  {
    name: "Velvet Skirt",
    slug: "velvet-skirt",
    oldSlugs: ["velvet-skirt"],
    price: "55.00",
    color: "Wine Red",
    rating: 4.2,
    reviewCount: 45,
    mainImage: "products/p6.webp",
    gallery: [
      "products/p6.webp",
      "products/p6-1.webp",
      "products/p6-2.webp",
      "products/p6-3.webp",
    ],
  },
  {
    name: "Wool Trench Coat",
    slug: "wool-trench-coat",
    oldSlugs: ["wool-trench-coat", "sunrise-on-the-red-sand-dunes"],
    price: "180.00",
    color: "Camel",
    rating: 4.6,
    reviewCount: 80,
    mainImage: "products/p7.webp",
    gallery: [
      "products/p7.webp",
      "products/p7-1.webp",
      "products/p7-2.webp",
      "products/p7-3.webp",
    ],
  },
  {
    name: "Cotton Shirt",
    slug: "cotton-shirt",
    oldSlugs: ["cotton-shirt", "zara-lisboa-seoul"],
    price: "45.00",
    color: "White",
    rating: 4.1,
    reviewCount: 110,
    mainImage: "products/p8.webp",
    gallery: [
      "products/p8.webp",
      "products/p8-1.webp",
      "products/p8-2.webp",
      "products/p8-3.webp",
    ],
  },
];

async function syncProductsAndImages() {
  console.log("==================================================");
  console.log("🛒 SYNCING CISECO PRODUCTS & OBJECT STORAGE IMAGES");
  console.log("==================================================");

  const localProductsDir = path.resolve(__dirname, "../public/products");

  // Step 1: Collect all image keys needed and upload to bucket if not present
  const allImageKeys = new Set();
  for (const p of CISECO_PRODUCTS) {
    allImageKeys.add(p.mainImage);
    for (const g of p.gallery) {
      allImageKeys.add(g);
    }
  }

  console.log(`\nFound ${allImageKeys.size} unique product images to verify in bucket...`);

  for (const imageKey of allImageKeys) {
    const filename = path.basename(imageKey);
    const localPath = path.join(localProductsDir, filename);

    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️ Local file not found: ${localPath}`);
      continue;
    }

    const exists = await objectExists(imageKey);
    if (exists) {
      console.log(`   ✨ In bucket: ${imageKey}`);
    } else {
      console.log(`   ⬆️  Uploading ${filename} (${fs.statSync(localPath).size} bytes) to ${imageKey}...`);
      const buffer = fs.readFileSync(localPath);
      await uploadObject({
        key: imageKey,
        body: buffer,
        contentType: "image/webp",
        isPublic: true,
      });
      console.log(`   ✅ Uploaded: ${imageKey}`);
    }
  }

  // Step 2: Update database records
  console.log("\nUpdating PostgreSQL Product records...");

  for (const item of CISECO_PRODUCTS) {
    const mainImageUrl = getPublicUrl(item.mainImage);

    // Find product by any of its slugs
    let product = await prisma.product.findFirst({
      where: {
        slug: { in: item.oldSlugs },
      },
      include: {
        variants: true,
      },
    });

    if (!product) {
      console.warn(`⚠️ Product not found for slug: ${item.slug}, attempting find by name "${item.name}"`);
      product = await prisma.product.findFirst({
        where: { name: item.name },
        include: { variants: true },
      });
    }

    if (product) {
      // Update product name, slug, main image
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: item.name,
          slug: item.slug,
          image: mainImageUrl,
        },
      });

      // Update variants price & title if needed
      if (product.variants.length > 0) {
        await prisma.productVariant.updateMany({
          where: { productId: product.id },
          data: {
            price: item.price,
          },
        });
      }

      // Re-create or update gallery images
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });

      for (let i = 0; i < item.gallery.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: getPublicUrl(item.gallery[i]),
            alt: `${item.name} View ${i + 1}`,
            position: i,
          },
        });
      }

      console.log(`✅ Synced [${item.name}] (${item.slug}) -> ${mainImageUrl} with ${item.gallery.length} gallery images`);
    } else {
      console.error(`❌ Could not locate product record in database for ${item.name}`);
    }
  }

  console.log("\n==================================================");
  console.log("🎉 ALL CISECO PRODUCTS AND BUCKET IMAGES SYNCED!");
  console.log("==================================================");
  await prisma.$disconnect();
}

syncProductsAndImages().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
