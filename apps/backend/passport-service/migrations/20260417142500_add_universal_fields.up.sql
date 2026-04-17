-- Add universal fields to product_batches for global supply chain readiness
ALTER TABLE product_batches 
ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'Vietnam',
ADD COLUMN IF NOT EXISTS destination_country VARCHAR(100) DEFAULT 'Global',
ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(20) DEFAULT 'kg',
ADD COLUMN IF NOT EXISTS certificates_ipfs JSONB DEFAULT '[]'::JSONB;

-- Placeholder for comments
COMMENT ON COLUMN product_batches.origin_country IS 'ISO or full name of the production country';
COMMENT ON COLUMN product_batches.destination_country IS 'Target market for the batch';
COMMENT ON COLUMN product_batches.unit_of_measure IS 'kg, lbs, units, etc.';
COMMENT ON COLUMN product_batches.certificates_ipfs IS 'Array of IPFS hashes for compliance certificates (FDA, Halal, etc.)';
