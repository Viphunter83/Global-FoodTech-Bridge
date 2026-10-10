-- Default cold-chain SLA for the mango reference scenario (docs/SCENARIO_VIETNAM_MANGO.md):
-- -2..+5 °C. Batches can still override limits at creation or when pairing sensors.
INSERT INTO compliance_rules (country_code, product_type, requirement_name, requirement_type, min_value, max_value)
SELECT 'ALL', p, 'Cold Chain SLA', 'SLA_TEMP', -2.0, 5.0
FROM (VALUES ('DRIED_MANGO'), ('DRIED_MANGO_PREMIUM'), ('MANGO_SHAKE')) AS products(p)
WHERE NOT EXISTS (
    SELECT 1 FROM compliance_rules r
    WHERE r.country_code = 'ALL' AND r.product_type = products.p AND r.requirement_type = 'SLA_TEMP'
);
