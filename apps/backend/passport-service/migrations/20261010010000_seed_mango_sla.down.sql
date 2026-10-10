DELETE FROM compliance_rules
WHERE country_code = 'ALL' AND requirement_name = 'Cold Chain SLA'
  AND product_type IN ('DRIED_MANGO', 'DRIED_MANGO_PREMIUM', 'MANGO_SHAKE');
