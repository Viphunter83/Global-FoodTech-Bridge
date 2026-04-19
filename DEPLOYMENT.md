# 🚀 Global FoodTech Bridge - Production Deployment Guide (V2)

This definitive guide ensures all components of the Global FoodTech Bridge are synchronized across **Railway** and **Vercel**.

## 🏗 System Architecture (Production Status: POL Mainnet)

| Service | Type | Hosting | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Portal** | Next.js | **Vercel** | Multi-locale (EN/RU/VI/AR) |
| **Auth & Security** | Firebase | **Google Cloud** | IDP & Role Storage |
| **Blockchain Service** | NestJS | **Railway** | Polygon Mainnet (Live) |
| **IoT Service** | Go | **Railway** | Telemetry Ingestion |
| **Passport Service** | Go | **Railway** | Digital Passport API |

---

## 🔑 Phase 1: Security Handshake (CRITICAL)

The Frontend and Backends communicate via a shared secret. All services MUST have the same key.

1.  **Generate a Secret**: `openssl rand -base64 32`
2.  **Apply to Railway**: Set `INTERNAL_API_KEY` in settings for `blockchain-service`, `iot-service`, and `passport-service`.
3.  **Apply to Vercel**: Set `INTERNAL_API_KEY` in Vercel Project Settings. 
    *   *Warning*: Do NOT use `NEXT_PUBLIC_` prefix for this specific variable.

---

## 🛠 Phase 2: Backend Configuration (Railway)

### 1. Blockchain Service
*   **Root**: `apps/backend/blockchain-service`
*   **Contract**: `0xF48D6846Ac41AE6764f0747E2A1Cb282467F59E5` (Polygon Mainnet)
*   **RPC**: `https://polygon-mainnet.infura.io/v3/YOUR_KEY` or `https://polygon.drpc.org`
*   **Wallet**: `PRIVATE_KEY` must have ~2-5 POL for gas.

### 2. Passport & IoT Services
*   Ensure `DATABASE_URL` is shared between both.
*   `CORS_ALLOWED_ORIGINS` should include your Vercel production domain.

---

## 🌐 Phase 3: Frontend Inlining (Vercel)

Ensure these variables are set and a "Redeploy with Clean Cache" is performed:

| Variable | Recommended Value |
| :--- | :--- |
| `NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL` | `https://[your-blockchain].up.railway.app/api/v1` |
| `NEXT_PUBLIC_PASSPORT_SERVICE_URL` | `https://[your-passport].up.railway.app/api/v1` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `[Provided in Vercel_Configuration.md]` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `global-foodtech-bridge-prod` |
| `INTERNAL_API_KEY` | `[The secret from Phase 1]` |

---

## 🔍 Audit & Verification Suite

1.  **UI Verification**: Visit `/ru`, `/en`, etc. and verify "International Trade Corridors" branding.
2.  **Diagnostic Check**: Open F12 Browser Console.
    *   `[GFTB-DIAGNOSTIC] All variables present` -> Success.
    *   `[GFTB-HYDRATION] Initialized` -> Success.
3.  **Admin Redirects**: Visit `/admin`. It should redirect to Dashboard or Login instead of 404.
4.  **Merchant Funnel**: Check if buttons in "Ecosystem" section link to correct trade partners.

---

## 🚀 Final Release Note

Current Version: **v2.0-STABLE**
- Migrated to Polygon Mainnet.
- Hardened Environment Variable checks.
- Resolved 404 Admin Routing.
- Unified International Trade Corridor branding.

