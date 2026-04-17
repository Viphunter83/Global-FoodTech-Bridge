-- Up Migration: Enrich template steps with compliance requirements
-- 1. Cold Chain Compliance for Beef/Fish
UPDATE template_steps 
SET required_cert = 'COLD_CHAIN_CERT'
WHERE name = 'Cold Chain Logistics' 
AND template_id IN (SELECT id FROM supply_chain_templates WHERE name = 'Standard Cold Chain');

-- 2. Phytosanitary Certificate for Export Goods
UPDATE template_steps 
SET required_cert = 'PHYTOSANITARY'
WHERE name = 'Export Logistics' 
AND template_id IN (SELECT id FROM supply_chain_templates WHERE name = 'Ambient Goods Export');

-- 3. Harvest Certificate for Raw Materials
UPDATE template_steps 
SET required_cert = 'HARVEST_CERT'
WHERE name = 'Harvested & Dried' 
AND template_id IN (SELECT id FROM supply_chain_templates WHERE name = 'Ambient Goods Export');
