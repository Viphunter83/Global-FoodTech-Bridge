-- Enrich Vietnam Mango batch metadata
UPDATE product_batches
SET min_temp = 35.0,
    max_temp = 50.0,
    marketing_story = '{"en": "Sourced from the sun-drenched orchards of the Mekong Delta, our mangoes are dried using low-temperature heat pump technology to preserve 99% of nutrients and their vibrant golden color. Each pack represents our commitment to sustainable agriculture and fair trade practices."}'::jsonb,
    partner_redirect_url = 'https://globalfruits.com.vn/en/dried-mango'
WHERE id = 'daf6439a-a435-4fa8-84f7-cc15d7112c9a';
