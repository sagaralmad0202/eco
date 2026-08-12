UPDATE "products"
SET "image" = '/media/products/sunrise-on-the-red-sand-dunes.webp'
WHERE "slug" = 'sunrise-on-the-red-sand-dunes';

UPDATE "product_images"
SET "url" = '/media/products/sunrise-on-the-red-sand-dunes.webp'
WHERE "productId" = (
  SELECT "id" FROM "products" WHERE "slug" = 'sunrise-on-the-red-sand-dunes'
)
AND "position" = 0;

-- Correct only the known bad catalogue snapshot. Historical order lines keep
-- their immutable product details; this migration changes the image URL, not
-- the product, variant, quantity, price or financial totals.
UPDATE "order_items"
SET "imageUrl" = '/media/products/sunrise-on-the-red-sand-dunes.webp'
WHERE "variantId" IN (
  SELECT pv."id"
  FROM "product_variants" AS pv
  JOIN "products" AS p ON p."id" = pv."productId"
  WHERE p."slug" = 'sunrise-on-the-red-sand-dunes'
)
AND (
  "imageUrl" IS NULL
  OR "imageUrl" = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800'
);
