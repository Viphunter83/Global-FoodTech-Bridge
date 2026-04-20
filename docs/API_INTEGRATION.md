# API Integration Guide for Manufacturers

Welcome to the **Global FoodTech Bridge** ecosystem. This guide provides technical specifications for integrating your IoT telemetry data into our blockchain-verified trust network.

## 1. Authentication

All requests to the IoT Gateway must include the `X-Internal-API-Key` header. Contact your region administrator to receive your production API Key.

```http
X-Internal-API-Key: your_production_api_key_here
```

## 2. Telemetry Ingestion API

Use this endpoint to provide real-time sensor data for a specific production batch.

**Endpoint:** `POST /api/v1/telemetry`

### Base URLs
- **Staging:** `https://iot.staging.foodtech-bridge.org`
- **Production:** `https://iot.foodtech-bridge.org`

### Request Payload (JSON)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `batch_id` | UUID | Yes | The unique ID of the batch assigned during creation. |
| `temp` | Float | Yes | Current temperature in Celsius. |
| `lat` | Float | No | Current latitude (if GPS enabled). |
| `lon` | Float | No | Current longitude (if GPS enabled). |
| `device_id` | String | Yes | Unique ID of your IoT hardware sensor. |
| `humidity` | Float | No | Relative humidity percentage (0-100). |
| `pressure` | Float | No | Atmospheric pressure in hPa. |

### Example Request (cURL)

```bash
curl -X POST https://iot.foodtech-bridge.org/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: GFTB_PROD_AXS_9912" \
  -d '{
    "batch_id": "550e8400-e29b-41d4-a716-446655440000",
    "temp": -19.5,
    "lat": 43.65,
    "lon": -79.38,
    "device_id": "GW-99-SENSE",
    "humidity": 45.2
  }'
```

---

## 3. SLA & Compliance Notarization (Asynchronous Funnel)

Our system uses an **Event-Driven Architecture** to ensure sub-second response times for IoT gateways:

1.  **Ingestion**: Incoming telemetry is validated against the Batch Passport.
2.  **Streaming**: If an SLA violation is detected (e.g., temperature breach), the event is published to a **Redis Stream** (`batch:violations`).
3.  **Notarization**: A background worker processes the stream to create an immutable evidence record on the **Polygon Blockchain**.

Manufacturers can monitor the status of their notarizations via:
`GET /api/v1/blockchain/status/:batchId`

---

## 4. Error Codes

- `401 Unauthorized`: Invalid or missing API Key.
- `400 Bad Request`: Invalid UUID format or malformed JSON.
- `500 Internal Server Error`: Platform processing failure (contact support).

---

© 2026 Global FoodTech Bridge | Advanced Compliance & Trust
