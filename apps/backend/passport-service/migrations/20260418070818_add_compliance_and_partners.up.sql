-- Up Migration: Add Compliance Rules, Partners, and Branding (Hardened version)

-- Extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Partners Table (For Monetization & Sales Funnels)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    verification_redirect_url TEXT NOT NULL,
    api_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Compliance Rules Table (Flexible SLAs and Regulatory Checks)
CREATE TABLE IF NOT EXISTS compliance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code VARCHAR(10) NOT NULL, -- Changed from CHAR(2) to support 'ALL'
    product_type VARCHAR(100),
    requirement_name VARCHAR(255) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL, -- "CERTIFICATE", "SLA_TEMP", "SLA_GPS"
    min_value DECIMAL(10, 2),
    max_value DECIMAL(10, 2),
    is_mandatory BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Link Batches to Partners
ALTER TABLE product_batches 
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_batches_partner_id ON product_batches(partner_id);
CREATE INDEX IF NOT EXISTS idx_compliance_country_product ON compliance_rules(country_code, product_type);

-- 5. Seed Initial Data
INSERT INTO partners (name, verification_redirect_url, api_key)
VALUES ('Organic Global Food', 'https://organic-global-food.demo/verify', 'partner_demo_key_123');

INSERT INTO compliance_rules (country_code, requirement_name, requirement_type, description)
VALUES ('AE', 'Halal Certification', 'CERTIFICATE', 'Mandatory Halal certificate for food entry into UAE.');

INSERT INTO compliance_rules (country_code, product_type, requirement_name, requirement_type, description)
VALUES ('VN', 'PHO_BO_SOUP', 'Export Health Certificate', 'CERTIFICATE', 'Standard export health cert for Vietnam.');

INSERT INTO compliance_rules (country_code, product_type, requirement_name, requirement_type, min_value, max_value)
VALUES ('ALL', 'PHO_BO_SOUP', 'Frozen Storage SLA', 'SLA_TEMP', -25.0, -18.0);
