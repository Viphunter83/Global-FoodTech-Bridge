-- Add GLN and VAT columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS gln_number TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT;
