CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100),
    status VARCHAR(20) DEFAULT 'IDLE', -- IDLE, ACTIVE, MAINTENANCE, FAULTY
    company_id UUID, -- For assigning to specific manufacturers
    battery_level INT DEFAULT 100,
    last_ping TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup during telemetry ingestion
CREATE INDEX IF NOT EXISTS idx_sensors_serial_number ON sensors(serial_number);

-- Optional: Link telemetry_readings to sensors for data integrity
-- This assumes device_id in telemetry_readings is the serial_number
-- ALTER TABLE telemetry_readings ADD CONSTRAINT fk_sensor FOREIGN KEY (device_id) REFERENCES sensors(serial_number);
