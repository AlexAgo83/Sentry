-- Ensure tables land in the sentry schema.
SET search_path = "sentry";

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "username" TEXT,
ADD COLUMN "usernameCanonical" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_usernameCanonical_key" ON "User"("usernameCanonical");
