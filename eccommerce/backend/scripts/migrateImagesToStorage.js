#!/usr/bin/env node

/**
 * Migration Script: Migrate Existing Backend Images to Object Storage
 *
 * Scans existing backend image directories (backend/public/products and backend/public/uploads),
 * uploads unique images to the configured Object Storage bucket (idempotently),
 * and updates corresponding PostgreSQL database records with the direct bucket URLs.
 *
 * Usage:
 *   node scripts/migrateImagesToStorage.js [--dry-run] [--force]
 */

const fs = require("fs");
const path = require("path");
const prisma = require("../src/lib/prisma");
const { uploadObject, objectExists, getPublicUrl } = require("../src/lib/storage");
const env = require("../src/config/env");

const isDryRun =
  process.argv.some((arg) => arg.includes("dry-run")) ||
  process.env.DRY_RUN === "true";
const isForce =
  process.argv.some((arg) => arg.includes("force")) ||
  process.env.FORCE === "true";

const MIME_MAP = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

const BASE_PUBLIC_DIR = path.resolve(__dirname, "../public");
const DIRS_TO_MIGRATE = [
  { dir: path.join(BASE_PUBLIC_DIR, "products"), prefix: "products", mediaRoute: "/media/products" },
  { dir: path.join(BASE_PUBLIC_DIR, "uploads"), prefix: "uploads", mediaRoute: "/media/uploads" },
  { dir: path.join(BASE_PUBLIC_DIR, "avatars"), prefix: "avatars", mediaRoute: "/media/avatars" },
];

async function runMigration() {
  console.log("\n==================================================");
  console.log("🚀 STARTING OBJECT STORAGE IMAGE MIGRATION");
  if (isDryRun) console.log("   [DRY RUN MODE — NO CHANGES WILL BE WRITTEN]");
  console.log("==================================================");
  console.log(`Storage Bucket:   ${env.STORAGE_BUCKET || "ecommerce"}`);
  console.log(`Storage Endpoint: ${env.STORAGE_ENDPOINT || "https://storage.neon.tech"}`);
  console.log(`Public Base URL:  ${env.STORAGE_PUBLIC_URL || getPublicUrl("")}\n`);

  const report = {
    totalFound: 0,
    alreadyMigrated: 0,
    reusedBucketObject: 0,
    uploaded: 0,
    dbRecordsUpdated: 0,
    failures: [],
  };

  for (const { dir, prefix, mediaRoute } of DIRS_TO_MIGRATE) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return Boolean(MIME_MAP[ext]) && fs.statSync(path.join(dir, f)).isFile();
    });

    for (const filename of files) {
      report.totalFound++;
      const filePath = path.join(dir, filename);
      const ext = path.extname(filename).toLowerCase();
      const contentType = MIME_MAP[ext] || "application/octet-stream";
      const objectKey = `${prefix}/${filename}`;
      const targetBucketUrl = getPublicUrl(objectKey);

      // Relative media path stored in DB (e.g. "/media/products/leather-tote-bag.webp")
      const localMediaMatch = `${mediaRoute}/${filename}`;

      console.log(`\n📦 Processing: ${objectKey}`);

      try {
        // Step 1: Check database to see if already migrated to a bucket URL
        const matchingProducts = await prisma.product.findMany({
          where: {
            OR: [
              { image: { contains: filename } },
              { image: localMediaMatch },
            ],
          },
        });

        const matchingImages = await prisma.productImage.findMany({
          where: {
            OR: [
              { url: { contains: filename } },
              { url: localMediaMatch },
            ],
          },
        });

        const matchingUsers = await prisma.user.findMany({
          where: {
            OR: [
              { avatarUrl: { contains: filename } },
              { avatarUrl: localMediaMatch },
            ],
          },
        });

        const allRecords = [
          ...matchingProducts.map((p) => ({ type: "Product.image", id: p.id, current: p.image })),
          ...matchingImages.map((i) => ({ type: "ProductImage.url", id: i.id, current: i.url })),
          ...matchingUsers.map((u) => ({ type: "User.avatarUrl", id: u.id, current: u.avatarUrl })),
        ];

        const unmigratedRecords = allRecords.filter(
          (r) => r.current !== targetBucketUrl,
        );

        if (allRecords.length > 0 && unmigratedRecords.length === 0 && !isForce) {
          console.log(`   ⏭️  Already migrated in DB (${allRecords.length} records)`);
          report.alreadyMigrated++;
          continue;
        }

        // Step 2: Check if object already exists in the bucket
        let existsInBucket = false;
        if (!isForce && !isDryRun && env.STORAGE_ACCESS_KEY && env.STORAGE_SECRET_KEY) {
          existsInBucket = await objectExists(objectKey);
        }

        if (existsInBucket) {
          console.log(`   ✨ Reusing existing object in bucket: ${targetBucketUrl}`);
          report.reusedBucketObject++;
        } else {
          // Step 3: Upload to bucket
          if (isDryRun) {
            console.log(`   [DRY RUN] Would upload ${filePath} (${fs.statSync(filePath).size} bytes) to ${objectKey}`);
            report.uploaded++;
          } else {
            if (!env.STORAGE_ACCESS_KEY || !env.STORAGE_SECRET_KEY) {
              throw new Error("Missing STORAGE_ACCESS_KEY or STORAGE_SECRET_KEY in .env");
            }
            console.log(`   ⬆️  Uploading ${filePath} (${fs.statSync(filePath).size} bytes)...`);
            const buffer = fs.readFileSync(filePath);
            await uploadObject({
              key: objectKey,
              body: buffer,
              contentType,
              isPublic: true,
            });
            report.uploaded++;
          }
        }

        // Step 4: Update PostgreSQL database records
        if (!isDryRun) {
          // Update Products
          for (const prod of matchingProducts) {
            if (prod.image !== targetBucketUrl) {
              await prisma.product.update({
                where: { id: prod.id },
                data: { image: targetBucketUrl },
              });
              report.dbRecordsUpdated++;
              console.log(`   ✅ Updated Product [${prod.slug}] image -> ${targetBucketUrl}`);
            }
          }

          // Update Product Images
          for (const img of matchingImages) {
            if (img.url !== targetBucketUrl) {
              await prisma.productImage.update({
                where: { id: img.id },
                data: { url: targetBucketUrl },
              });
              report.dbRecordsUpdated++;
              console.log(`   ✅ Updated ProductImage [${img.id}] url -> ${targetBucketUrl}`);
            }
          }

          // Update Users
          for (const usr of matchingUsers) {
            if (usr.avatarUrl !== targetBucketUrl) {
              await prisma.user.update({
                where: { id: usr.id },
                data: { avatarUrl: targetBucketUrl },
              });
              report.dbRecordsUpdated++;
              console.log(`   ✅ Updated User [${usr.email}] avatarUrl -> ${targetBucketUrl}`);
            }
          }
        } else {
          console.log(`   [DRY RUN] Would update ${unmigratedRecords.length} DB records to ${targetBucketUrl}`);
        }
      } catch (err) {
        console.error(`   ❌ Failed to migrate ${objectKey}: ${err.message}`);
        report.failures.push({ file: objectKey, error: err.message });
      }
    }
  }

  console.log("\n==================================================");
  console.log("📊 IMAGE MIGRATION REPORT SUMMARY");
  console.log("==================================================");
  console.log(`Total local images found:       ${report.totalFound}`);
  console.log(`Already migrated in DB:         ${report.alreadyMigrated}`);
  console.log(`Reused existing bucket objects: ${report.reusedBucketObject}`);
  console.log(`Uploaded successfully:          ${report.uploaded}`);
  console.log(`Database records updated:       ${report.dbRecordsUpdated}`);
  console.log(`Failures:                       ${report.failures.length}`);

  if (report.failures.length > 0) {
    console.log("\nFailures Detail:");
    for (const f of report.failures) {
      console.log(` - ${f.file}: ${f.error}`);
    }
  }
  console.log("==================================================\n");

  await prisma.$disconnect();
  return report;
}

if (require.main === module) {
  runMigration()
    .then((report) => {
      if (report.failures.length > 0) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal migration error:", err);
      process.exit(1);
    });
}

module.exports = { runMigration };
