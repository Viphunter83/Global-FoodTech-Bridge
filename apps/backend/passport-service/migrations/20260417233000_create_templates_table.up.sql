-- Up Migration: Create Supply Chain Templates and Steps
CREATE TABLE IF NOT EXISTS supply_chain_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS template_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES supply_chain_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT 'package', -- package, truck, warehouse, check, leaf
    description TEXT,
    required_cert VARCHAR(100), -- Optional: e.g. "Halal", "Phytosanitary"
    UNIQUE(template_id, step_order)
);

-- Link product_batches to a template
ALTER TABLE product_batches 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES supply_chain_templates(id);

-- Insert Default Templates
-- 1. Cold Chain (Standard)
WITH new_template AS (
    INSERT INTO supply_chain_templates (name, description) 
    VALUES ('Standard Cold Chain', 'General supply chain for temperature-sensitive products like beef or fish.')
    RETURNING id
)
INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 1, 'Produced & Packed', 'package', 'Product manufactured and flash-frozen at source.' FROM new_template UNION ALL
SELECT id, 2, 'Quality Check (AI)', 'check', 'AI-assisted visual and safety audit.' FROM new_template UNION ALL
SELECT id, 3, 'Cold Chain Logistics', 'truck', 'International transit under strict temperature control.' FROM new_template UNION ALL
SELECT id, 4, 'Regional Hub Arrival', 'warehouse', 'Entry into the destination market hub.' FROM new_template UNION ALL
SELECT id, 5, 'Final Delivery', 'fork', 'Last-mile delivery to the retailer shelf.' FROM new_template;

-- 2. Ambient Food (Dry Goods)
WITH new_template AS (
    INSERT INTO supply_chain_templates (name, description) 
    VALUES ('Ambient Goods Export', 'Safe transit for dry goods with standard shelf life.')
    RETURNING id
)
INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 1, 'Harvested & Dried', 'leaf', 'Raw material processing and drying.' FROM new_template UNION ALL
SELECT id, 2, 'Vacuum Packaging', 'package', 'Sealed packaging for shelf-life stability.' FROM new_template UNION ALL
SELECT id, 3, 'Export Logistics', 'truck', 'Standard container maritime or air freight.' FROM new_template UNION ALL
SELECT id, 4, 'Ready for Distribution', 'warehouse', 'Distribution to global retailers.' FROM new_template;
