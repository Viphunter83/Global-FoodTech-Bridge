CREATE TABLE IF NOT EXISTS product_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    manufacturer_id UUID NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    batch_size INTEGER NOT NULL,
    usf_status VARCHAR(20) DEFAULT 'PENDING',
    blockchain_hash VARCHAR(66)
);
