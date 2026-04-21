-- Final stabilization for Global FoodTech Bridge Passport Service
-- Ensure all missing columns exist in product_batches and companies

-- product_batches updates
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS min_temp DOUBLE PRECISION;
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS max_temp DOUBLE PRECISION;
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS marketing_story JSONB;
ALTER TABLE product_batches ADD COLUMN IF NOT EXISTS partner_redirect_url TEXT;

-- companies updates
ALTER TABLE companies ADD COLUMN IF NOT EXISTS gln_number TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Cleanup attempt to update existing Mango batch if it exists and missed previous updates
UPDATE product_batches
SET min_temp = 35.0,
    max_temp = 50.0,
    marketing_story = '{"en": "Sourced from the sun-drenched orchards of the Mekong Delta, our mangoes are dried using low-temperature heat pump technology to preserve 99% of nutrients and their vibrant golden color."}'::jsonb,
    partner_redirect_url = 'https://globalfruits.com.vn/en/dried-mango'
WHERE id = 'daf6439a-a435-4fa8-84f7-cc15d7112c9a'
   OR product_type = 'Mango_Shake';
