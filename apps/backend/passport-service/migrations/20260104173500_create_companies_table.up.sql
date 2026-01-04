CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'MANUFACTURER', 'LOGISTICS', 'RETAILER'
    wallet_address TEXT NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,
    production_location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_wallet_address ON companies(wallet_address);
