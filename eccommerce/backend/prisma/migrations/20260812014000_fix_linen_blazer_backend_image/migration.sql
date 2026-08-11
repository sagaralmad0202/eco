UPDATE "products"
SET "image" = '/media/products/linen-blazer.webp'
WHERE "slug" = 'linen-blazer';

UPDATE "product_images"
SET "url" = '/media/products/linen-blazer.webp'
WHERE "productId" = (
  SELECT "id" FROM "products" WHERE "slug" = 'linen-blazer'
)
AND "position" = 0;

UPDATE "order_items"
SET "imageUrl" = '/media/products/linen-blazer.webp'
WHERE "variantId" IN (
  SELECT pv."id"
  FROM "product_variants" AS pv
  JOIN "products" AS p ON p."id" = pv."productId"
  WHERE p."slug" = 'linen-blazer'
);
