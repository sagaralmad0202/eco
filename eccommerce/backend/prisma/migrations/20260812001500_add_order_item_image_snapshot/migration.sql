ALTER TABLE "order_items" ADD COLUMN "imageUrl" TEXT;

-- Backfill existing orders from the current product image. New orders keep an
-- immutable snapshot even if the catalog image changes later.
UPDATE "order_items" AS oi
SET "imageUrl" = COALESCE(
  p."image",
  (
    SELECT pi."url"
    FROM "product_images" AS pi
    WHERE pi."productId" = p."id"
    ORDER BY pi."position" ASC, pi."id" ASC
    LIMIT 1
  )
)
FROM "product_variants" AS pv
JOIN "products" AS p ON p."id" = pv."productId"
WHERE oi."variantId" = pv."id"
  AND oi."imageUrl" IS NULL;
