#!/bin/bash
API_KEY="ftb_internal_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d"
PASSPORT_URL="https://chic-playfulness-production-d0d6.up.railway.app/api/v1"
TELEMETRY_URL="https://celebrated-consideration-production.up.railway.app/api/v1"

echo "🚀 Stage 1: Creating Premium Vietnam Mango Batch..."
RESPONSE=$(curl -s -X POST $PASSPORT_URL/batches \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "X-User-Role: MANUFACTURER" \
  -d '{
    "manufacturer_id": "550e8400-e29b-41d4-a716-446655440000", 
    "product_type": "DRIED_MANGO", 
    "batch_size": 1200,
    "template_id": "1bccdd0c-3cdf-41fb-b51a-0fed8133a818",
    "origin_country": "Vietnam (Bến Tre Province)",
    "destination_country": "USA (Los Angeles Port)",
    "partner_redirect_url": "https://global-food-tech-bridge.vercel.app/demo-shop/vietnam-mango",
    "ingredients": {
      "en": "Organic Cat Chu Mango (98%), Natural Cane Sugar (2%)",
      "ru": "Органический манго Кат Чу (98%), Натуральный тростниковый сахар (2%)",
      "vi": "Xoài Cát Chu hữu cơ (98%), Đường mía tự nhiên (2%)"
    },
    "nutrition": {
      "calories": 320,
      "protein": 2,
      "fat": 0.5,
      "carbs": 78
    },
    "marketing_story": {
      "en": "Grown in the lush Mekong Delta, our mangoes are slow-dried at low temperatures to preserve nutrients and intense tropical flavor.",
      "ru": "Выращенные в пышной дельте Меконга, наши манго сушатся при низких температурах, чтобы сохранить питательные вещества и насыщенный вкус."
    },
    "certificates": [
      {"type": "HALAL", "id": "VN-H-2026-992"},
      {"type": "ORGANIC", "id": "USDA-ORG-VN-01"}
    ]
  }')

BATCH_ID=$(echo $RESPONSE | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)

if [ -z "$BATCH_ID" ]; then
  echo "❌ Error: $RESPONSE"
  exit 1
fi

echo "✅ Batch Created: $BATCH_ID"

echo "🚛 Stage 2: Simulating Ocean Transit Telemetry (Temp Control)..."
# Initial warm temp at factory, then cooling in reefer container
TEMPS=(28.5 25.0 20.0 15.5 10.0 5.2 4.8 5.0)
LATS=(10.76 10.0 5.0 0.0 -10.0 -20.0 30.0 34.0)
LONS=(106.66 110.0 120.0 130.0 140.0 150.0 -130.0 -118.0)

for i in "${!TEMPS[@]}"; do
   curl -s -o /dev/null -X POST $TELEMETRY_URL/telemetry \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "{
      \"batch_id\": \"$BATCH_ID\",
      \"device_id\": \"TIVE-VN-992\",
      \"temp\": ${TEMPS[$i]},
      \"lat\": ${LATS[$i]},
      \"lon\": ${LONS[$i]}
    }"
   echo "  -> Data Node $i: ${TEMPS[$i]}C at [${LATS[$i]}, ${LONS[$i]}]"
done

echo "🎉 Stage 1 & 2 Complete! Mango Batch is LIVE."
echo "🔗 Verification Link: https://global-food-tech-bridge.vercel.app/en/verify/$BATCH_ID"
