-- Ensure columns exist in case previous attempt failed or service didn't run migrations
ALTER TABLE telemetry_readings ADD COLUMN IF NOT EXISTS humidity DOUBLE PRECISION;
ALTER TABLE telemetry_readings ADD COLUMN IF NOT EXISTS pressure DOUBLE PRECISION;

-- Fix the Vietnam Mango batch limits to allow industrial drying temperatures (40-45C)
-- Batch ID: 1f545978-f822-4cc0-b111-cdce374f7644
UPDATE product_batches 
SET max_temp = 50.0, 
    min_temp = 35.0 
WHERE id = '1f545978-f822-4cc0-b111-cdce374f7644';
