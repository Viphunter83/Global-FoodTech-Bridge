-- batch_size has been read and written by the repository since the first release,
-- but no migration ever created it (production got it by a manual change).
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS batch_size INTEGER NOT NULL DEFAULT 0;
