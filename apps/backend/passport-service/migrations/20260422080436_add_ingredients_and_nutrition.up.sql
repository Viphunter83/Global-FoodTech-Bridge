-- Add Ingredients and Nutrition fields to product_batches
ALTER TABLE product_batches
ADD COLUMN IF NOT EXISTS ingredients JSONB,
ADD COLUMN IF NOT EXISTS nutrition JSONB;

COMMENT ON COLUMN product_batches.ingredients IS 'List of ingredients, potentially localized';
COMMENT ON COLUMN product_batches.nutrition IS 'Nutrition facts object (calories, proteins, etc.)';
