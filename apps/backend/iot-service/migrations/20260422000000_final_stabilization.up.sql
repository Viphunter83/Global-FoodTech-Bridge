-- Final stabilization for Global FoodTech Bridge IoT
-- Ensure all missing columns exist in telemetry_readings
ALTER TABLE telemetry_readings ADD COLUMN IF NOT EXISTS humidity DOUBLE PRECISION;
ALTER TABLE telemetry_readings ADD COLUMN IF NOT EXISTS pressure DOUBLE PRECISION;
ALTER TABLE telemetry_readings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Cleanup any potential duplicate migration state if needed
-- (Idempotent script)
