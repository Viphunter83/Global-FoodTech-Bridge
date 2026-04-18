CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE product_type AS ENUM ('Vietnam_Soup', 'Mango_Shake');
CREATE TYPE validation_status AS ENUM ('Pending', 'Verified');

CREATE TABLE IF NOT EXISTS product_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    manufacturer_id TEXT NOT NULL,
    product_type TEXT NOT NULL, -- keeping as text for simplicity, or use ENUM type if supported by driver
    usf_status TEXT NOT NULL DEFAULT 'Pending',
    blockchain_hash TEXT
);
