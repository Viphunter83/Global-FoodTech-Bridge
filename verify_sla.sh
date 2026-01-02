#!/bin/bash

# 1. Create Batch (Pho Bo Soup: Min -25, Max -18)
echo "Creating Batch..."
RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/batches \
  -H "Content-Type: application/json" \
  -d '{"manufacturer_id": "550e8400-e29b-41d4-a716-446655440000", "product_type": "PHO_BO_SOUP", "batch_size": 100}')

BATCH_ID=$(echo $RESPONSE | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')

if [ -z "$BATCH_ID" ]; then
  echo "❌ Error: Could not get Batch ID. Response: $RESPONSE"
  exit 1
fi
echo "✅ Batch Created: $BATCH_ID"

# 2. Send Violation (-10C, Limit is -18C)
echo "Sending Temperature: -10C (Violation)..."
curl -s -o /dev/null -X POST http://localhost:8081/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -d "{
    \"batch_id\": \"$BATCH_ID\",
    \"device_id\": \"SENSOR-TEST\",
    \"temp\": -10.0
  }"

# 3. Check Alerts
echo "Checking Alerts..."
sleep 1
ALERTS=$(curl -s http://localhost:8081/api/v1/telemetry/$BATCH_ID/alerts)
echo "Alerts Response: $ALERTS"

if [[ $ALERTS == *"TEMP_HIGH"* ]]; then
  echo "✅ SLA Verification Passed! Alert found."
else
  echo "❌ SLA Verification Failed! No alert found."
fi
