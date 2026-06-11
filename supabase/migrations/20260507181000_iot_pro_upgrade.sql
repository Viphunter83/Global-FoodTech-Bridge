-- Update batches to support multiple sensors and tracking start time
ALTER TABLE product_batches 
DROP COLUMN IF EXISTS sensor_id;

ALTER TABLE product_batches 
ADD COLUMN IF NOT EXISTS sensor_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tracking_started_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN product_batches.sensor_ids IS 'Array of serial numbers for IoT sensors assigned to this batch';
COMMENT ON COLUMN product_batches.tracking_started_at IS 'The moment when official temperature monitoring began (after container stabilization)';
