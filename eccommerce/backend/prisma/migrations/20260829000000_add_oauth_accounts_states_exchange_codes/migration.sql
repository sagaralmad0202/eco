-- Social login support:
--   oauth_accounts        provider identities linked to users
--   oauth_states          CSRF state (hashed) + PKCE verifiers for the OAuth round-trip
--   oauth_exchange_codes  one-time hashed codes swapped for app tokens after login

CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_accounts_provider_providerUserId_key" ON "oauth_accounts"("provider", "providerUserId");

CREATE INDEX "oauth_accounts_userId_idx" ON "oauth_accounts"("userId");

ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "oauth_states" (
    "id" UUID NOT NULL,
    "stateHash" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "codeVerifier" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_states_stateHash_key" ON "oauth_states"("stateHash");

CREATE TABLE "oauth_exchange_codes" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_exchange_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_exchange_codes_codeHash_key" ON "oauth_exchange_codes"("codeHash");

CREATE INDEX "oauth_exchange_codes_userId_idx" ON "oauth_exchange_codes"("userId");

ALTER TABLE "oauth_exchange_codes" ADD CONSTRAINT "oauth_exchange_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
