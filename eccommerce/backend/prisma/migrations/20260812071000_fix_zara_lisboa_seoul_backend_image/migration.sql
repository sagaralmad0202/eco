UPDATE "products"
SET "image" = '/media/products/zara-lisboa-seoul.webp'
WHERE "slug" = 'zara-lisboa-seoul';

UPDATE "product_images"
SET "url" = '/media/products/zara-lisboa-seoul.webp'
WHERE "productId" = (
  SELECT "id" FROM "products" WHERE "slug" = 'zara-lisboa-seoul'
)
AND "position" = 0;

-- Backfill only the known unrelated catalogue snapshot. Product identity,
-- variant, quantity, price, payment and order totals remain unchanged.
UPDATE "order_items"
SET "imageUrl" = '/media/products/zara-lisboa-seoul.webp'
WHERE "variantId" IN (
  SELECT pv."id"
  FROM "product_variants" AS pv
  JOIN "products" AS p ON p."id" = pv."productId"
  WHERE p."slug" = 'zara-lisboa-seoul'
)
AND (
  "imageUrl" IS NULL
  OR "imageUrl" = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'
);
