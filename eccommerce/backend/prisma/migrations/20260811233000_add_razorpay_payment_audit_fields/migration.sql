-- A provider order maps to exactly one internal payment attempt. PostgreSQL
-- permits multiple NULLs in a unique index, so pre-Razorpay placeholder rows
-- remain valid while webhook lookup becomes unambiguous.
CREATE UNIQUE INDEX "payments_providerOrderId_key"
ON "payments"("providerOrderId");

-- Retained only after successful server-side HMAC verification. The API
-- serializer deliberately never returns this audit field to the browser.
ALTER TABLE "payments" ADD COLUMN "signature" TEXT;
