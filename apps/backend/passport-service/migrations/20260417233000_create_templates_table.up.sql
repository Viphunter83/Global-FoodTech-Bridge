-- Up Migration: Create Supply Chain Templates and Steps
CREATE TABLE IF NOT EXISTS supply_chain_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL, -- Added UNIQUE for idempotency
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS template_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES supply_chain_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT 'package',
    description TEXT,
    required_cert VARCHAR(100),
    UNIQUE(template_id, step_order)
);

-- Link product_batches to a template
ALTER TABLE product_batches 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES supply_chain_templates(id);

-- Insert Default Templates (Idempotent)
INSERT INTO supply_chain_templates (name, description) 
VALUES ('Standard Cold Chain', 'General supply chain for temperature-sensitive products like beef or fish.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 1, 'Produced & Packed', 'package', 'Product manufactured and flash-frozen at source.' FROM supply_chain_templates WHERE name = 'Standard Cold Chain'
ON CONFLICT (template_id, step_order) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 2, 'Quality Check (AI)', 'check', 'AI-assisted visual and safety audit.' FROM supply_chain_templates WHERE name = 'Standard Cold Chain'
ON CONFLICT (template_id, step_order) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 3, 'Cold Chain Logistics', 'truck', 'International transit under strict temperature control.' FROM supply_chain_templates WHERE name = 'Standard Cold Chain'
ON CONFLICT (template_id, step_order) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 4, 'Regional Hub Arrival', 'warehouse', 'Entry into the destination market hub.' FROM supply_chain_templates WHERE name = 'Standard Cold Chain'
ON CONFLICT (template_id, step_order) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 5, 'Final Delivery', 'fork', 'Last-mile delivery to the retailer shelf.' FROM supply_chain_templates WHERE name = 'Standard Cold Chain'
ON CONFLICT (template_id, step_order) DO NOTHING;

-- 2. Ambient Food (Idempotent)
INSERT INTO supply_chain_templates (name, description) 
VALUES ('Ambient Goods Export', 'Safe transit for dry goods with standard shelf life.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 1, 'Harvested & Dried', 'leaf', 'Raw material processing and drying.' FROM supply_chain_templates WHERE name = 'Ambient Goods Export'
ON CONFLICT (template_id, step_order) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 2, 'Vacuum Packaging', 'package', 'Sealed packaging for shelf-life stability.' FROM supply_chain_templates WHERE name = 'Ambient Goods Export'
ON CONFLICT (template_id, step_order) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 3, 'Export Logistics', 'truck', 'Standard container maritime or air freight.' FROM supply_chain_templates WHERE name = 'Ambient Goods Export'
ON CONFLICT (template_id, step_order) DO NOTHING;

INSERT INTO template_steps (template_id, step_order, name, icon, description)
SELECT id, 4, 'Ready for Distribution', 'warehouse', 'Distribution to global retailers.' FROM supply_chain_templates WHERE name = 'Ambient Goods Export'
ON CONFLICT (template_id, step_order) DO NOTHING;
