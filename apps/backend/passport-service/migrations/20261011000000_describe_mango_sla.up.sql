-- 20261010010000 seeded mango SLA rules without a description; give them one
UPDATE compliance_rules
SET description = 'Cold-chain temperature window from the mango reference scenario'
WHERE requirement_name = 'Cold Chain SLA' AND description IS NULL;
