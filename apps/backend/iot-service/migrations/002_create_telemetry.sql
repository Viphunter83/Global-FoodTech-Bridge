CREATE TABLE IF NOT EXISTS telemetry_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    temperature_celsius DECIMAL(5, 2) NOT NULL,
    location_lat DECIMAL(9, 6),
    location_lon DECIMAL(9, 6),
    device_id VARCHAR(50) NOT NULL,
    CONSTRAINT fk_batch
        FOREIGN KEY(batch_id) 
        REFERENCES product_batches(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_telemetry_batch_id ON telemetry_readings(batch_id);
CREATE INDEX idx_telemetry_device_id ON telemetry_readings(device_id);
