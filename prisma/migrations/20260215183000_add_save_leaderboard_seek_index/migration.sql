-- Ensure tables land in the sentry schema.
SET search_path = "sentry";

-- CreateIndex
CREATE INDEX "Save_virtualScore_updatedAt_id_idx"
ON "Save" ("virtualScore" DESC, "updatedAt" DESC, "id" ASC);

