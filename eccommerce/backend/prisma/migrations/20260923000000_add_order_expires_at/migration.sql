-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_status_expiresAt_idx" ON "orders"("status", "expiresAt");
