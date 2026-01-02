#!/bin/bash

# 1. Create Batch
echo "Creating Batch..."
RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/batches \
  -H "Content-Type: application/json" \
  -d '{"manufacturer_id": "550e8400-e29b-41d4-a716-446655440000", "product_type": "PHO_BO_SOUP", "batch_size": 500}')

# Extract Batch ID using grep/sed (simple constraint: we know it's a UUID)
BATCH_ID=$(echo $RESPONSE | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')

if [ -z "$BATCH_ID" ]; then
  echo "❌ Error: Could not get Batch ID. Response: $RESPONSE"
  exit 1
fi

echo "✅ Batch Created: $BATCH_ID"
echo "👉 Dashboard: http://localhost:3001/batches/$BATCH_ID"

# 2. Inject Telemetry
echo "Injecting Data..."
for i in {0..5}; do
   # Vary temp slightly
   TEMP=$(echo "-20 + $i * 0.2" | bc)
   
   curl -s -o /dev/null -X POST http://localhost:8081/api/v1/telemetry \
    -H "Content-Type: application/json" \
    -d "{
      \"batch_id\": \"$BATCH_ID\",
      \"device_id\": \"SENSOR-SIM-01\",
      \"temp\": $TEMP,
      \"lat\": 55.75,
      \"lon\": 37.61
    }"
   echo "  -> Sent Temp: ${TEMP}C"
   sleep 1
done

echo "✅ Simulation Complete!"
