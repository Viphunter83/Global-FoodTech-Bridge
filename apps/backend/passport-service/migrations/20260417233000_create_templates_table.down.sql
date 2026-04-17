-- Down Migration: Remove Supply Chain Templates and Steps
ALTER TABLE product_batches DROP COLUMN IF EXISTS template_id;
DROP TABLE IF EXISTS template_steps;
DROP TABLE IF EXISTS supply_chain_templates;
