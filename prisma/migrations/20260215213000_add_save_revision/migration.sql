-- Add a monotonically increasing revision token for optimistic concurrency.
ALTER TABLE "Save" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0;

