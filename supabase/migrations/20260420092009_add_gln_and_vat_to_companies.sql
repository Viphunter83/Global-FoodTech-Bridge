-- Add GLN and VAT fields to companies table
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS gln_number TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS vat_number TEXT;

-- Create index for faster GLN lookups
CREATE INDEX IF NOT EXISTS idx_companies_gln_number ON companies(gln_number);

-- Update existing companies with placeholder or NULL value (they will need manual enrichment)
COMMENT ON COLUMN companies.gln_number IS 'GS1 Global Location Number (13 digits)';
COMMENT ON COLUMN companies.vat_number IS 'Value Added Tax Registration Number (National ID)';
