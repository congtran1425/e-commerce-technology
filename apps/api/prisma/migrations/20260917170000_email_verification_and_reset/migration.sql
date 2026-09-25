CREATE TYPE "AccountTokenPurpose" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

ALTER TABLE "users" ADD COLUMN "email_verified_at" TIMESTAMPTZ(3);

CREATE TABLE "account_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "purpose" "AccountTokenPurpose" NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "account_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "account_tokens_token_hash_key" ON "account_tokens"("token_hash");
CREATE UNIQUE INDEX "account_tokens_user_id_purpose_key" ON "account_tokens"("user_id", "purpose");
CREATE INDEX "account_tokens_expires_at_idx" ON "account_tokens"("expires_at");
ALTER TABLE "account_tokens" ADD CONSTRAINT "account_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
