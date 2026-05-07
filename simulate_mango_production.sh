#!/bin/bash
API_KEY="ftb_internal_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d"
PASSPORT_URL="https://chic-playfulness-production-d0d6.up.railway.app/api/v1"
TELEMETRY_URL="https://celebrated-consideration-production.up.railway.app/api/v1"
BLOCKCHAIN_URL="https://global-foodtech-bridge-production.up.railway.app/api/v1"

echo "🚀 Stage 1: Creating Premium Vietnam Mango Batch (Export to USA)..."
RESPONSE=$(curl -s -X POST $PASSPORT_URL/batches \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "X-User-Role: MANUFACTURER" \
  -d '{
    "manufacturer_id": "550e8400-e29b-41d4-a716-446655440000", 
    "product_type": "DRIED_MANGO_PREMIUM", 
    "batch_size": 2500,
    "template_id": "1bccdd0c-3cdf-41fb-b51a-0fed8133a818",
    "origin_country": "Vietnam (Bến Tre Province)",
    "destination_country": "USA (Port of Long Beach)",
    "partner_redirect_url": "https://global-food-tech-bridge.vercel.app/demo-shop/vietnam-mango",
    "ingredients": {
      "en": "Hand-picked Organic Cat Chu Mango (99%), Trace amount of natural lemon juice (1%)",
      "ru": "Органический манго Кат Чу ручного сбора (99%), натуральный лимонный сок (1%)",
      "vi": "Xoài Cát Chu hữu cơ hái tay (99%), nước cốt chanh tự nhiên (1%)"
    },
    "nutrition": {
      "calories": 310,
      "protein": 2.1,
      "fat": 0.4,
      "carbs": 76
    },
    "marketing_story": {
      "en": "Sourced from sustainable orchards in Bến Tre. Our advanced low-temperature dehydration technology preserves the vibrant color and complex nutrient profile of the fresh fruit. No added sugars. Pure Vietnamese heritage in every bite.",
      "ru": "Собрано в экологичных садах провинции Бенче. Наша передовая технология низкотемпературной дегидратации сохраняет яркий цвет и богатый состав свежего фрукта. Без добавления сахара. Чистый вкус Вьетнама в каждом кусочке.",
      "vi": "Được thu hoạch thủ công tại Đồng bằng sông Cửu Long trù phú, những quả xoài của chúng tôi được sấy chậm ở nhiệt độ thấp để giữ lại vị ngọt thanh tự nhiên như mật ong và hương thơm nhiệt đới nồng nàn."
    },
    "certificates": [
      {"type": "USDA_ORGANIC", "name": "USDA Organic Certificate", "uri": "https://ipfs.io/ipfs/bafybeihdwdv4s54"},
      {"type": "FDA_REGISTERED", "name": "FDA Facility Registration", "uri": "https://ipfs.io/ipfs/bafybeihdwdv4s54"},
      {"type": "GLOBAL_GAP", "name": "GLOBAL G.A.P. Standard", "uri": "https://ipfs.io/ipfs/bafybeihdwdv4s54"},
      {"type": "HACCP_GOLD", "name": "HACCP Food Safety Gold", "uri": "https://ipfs.io/ipfs/bafybeihdwdv4s54"}
    ]
  }')

BATCH_ID=$(echo $RESPONSE | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)

if [ -z "$BATCH_ID" ]; then
  echo "❌ Error Creating Batch: $RESPONSE"
  exit 1
fi

echo "✅ Batch Created: $BATCH_ID"

echo "🔗 Stage 2: Notarizing Batch on Blockchain..."
# Notarize the batch to make it "Verified" in the UI
curl -s -X POST "$BLOCKCHAIN_URL/blockchain/notarize" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
    \"batchId\": \"$BATCH_ID\",
    \"dataHash\": \"ipfs://premium-mango-metadata-$BATCH_ID\"
  }" > /dev/null
echo "✅ Notarization Complete"

echo "🚛 Stage 3: Simulating Long-Haul Reefer Transit (Temp Control Monitoring)..."
# Journey from HCM Port to USA with Tive IoT sensor simulation
# Maintaining optimal 4.5C range for dried fruit preservation
TEMPS=(26.2 18.0 10.5 4.8 4.4 4.5 4.6 4.4 4.5)
LATS=(10.76 8.0 2.0 -10.0 -30.0 10.0 25.0 33.0 33.7)
LONS=(106.66 110.0 120.0 140.0 160.0 -160.0 -130.0 -120.0 -118.2)

for i in "${!TEMPS[@]}"; do
   curl -s -o /dev/null -X POST $TELEMETRY_URL/telemetry \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "{
      \"batch_id\": \"$BATCH_ID\",
      \"device_id\": \"TIVE-EXP-USA-99\",
      \"temp\": ${TEMPS[$i]},
      \"lat\": ${LATS[$i]},
      \"lon\": ${LONS[$i]}
    }"
   echo "  -> IoT Log $i: ${TEMPS[$i]}°C at [${LATS[$i]}, ${LONS[$i]}]"
   sleep 0.2
done

echo "🎉 Production & Logistics Simulation Complete!"
echo "📍 Origin: Vietnam Factory (HACCP/FDA Certified)"
echo "📍 Destination: USA Retailer (Authenticated by GFTB)"
echo "🔗 Verification Link: https://global-food-tech-bridge.vercel.app/en/verify/$BATCH_ID"

