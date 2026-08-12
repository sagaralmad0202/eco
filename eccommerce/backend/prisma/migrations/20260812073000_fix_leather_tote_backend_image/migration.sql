UPDATE "products"
SET "image" = '/media/products/leather-tote-bag.webp'
WHERE "slug" = 'leather-tote-bag';

UPDATE "product_images"
SET "url" = '/media/products/leather-tote-bag.webp'
WHERE "productId" = (
  SELECT "id" FROM "products" WHERE "slug" = 'leather-tote-bag'
)
AND "position" = 0;

-- Correct only the known red-handbag snapshot. The order's product identity,
-- variant, quantity, price, payment and totals remain unchanged.
UPDATE "order_items"
SET "imageUrl" = '/media/products/leather-tote-bag.webp'
WHERE "variantId" IN (
  SELECT pv."id"
  FROM "product_variants" AS pv
  JOIN "products" AS p ON p."id" = pv."productId"
  WHERE p."slug" = 'leather-tote-bag'
)
AND (
  "imageUrl" IS NULL
  OR "imageUrl" = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'
);
