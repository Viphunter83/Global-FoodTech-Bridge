-- Add Marketing Story and Redirect URL fields to product_batches

ALTER TABLE product_batches
ADD COLUMN IF NOT EXISTS marketing_story JSONB,
ADD COLUMN IF NOT EXISTS partner_redirect_url TEXT;

COMMENT ON COLUMN product_batches.marketing_story IS 'Multi-language marketing story for the batch viewable in the consumer portal';
COMMENT ON COLUMN product_batches.partner_redirect_url IS 'Redirect URL for the sales funnel (e.g. online store URL)';
