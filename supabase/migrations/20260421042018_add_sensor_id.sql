-- Add sensor_id to link hardware trackers to cargo batches
ALTER TABLE product_batches 
ADD COLUMN IF NOT EXISTS sensor_id VARCHAR(50);

COMMENT ON COLUMN product_batches.sensor_id IS 'Serial number of the hardware IoT sensor currently tracking this batch';

-- Index for efficient filtering by sensor
CREATE INDEX IF NOT EXISTS idx_batches_sensor_id ON product_batches(sensor_id);
