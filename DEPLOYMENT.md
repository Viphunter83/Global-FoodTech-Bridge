# 🚀 Global FoodTech Bridge - Deployment Guide

This guide helps you deploy the project to **Railway** (Backend & Database) and **Vercel** (Frontend).

## 🏗 System Architecture

The project consists of 5 main components:

| Service | Type | Hosting | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Portal** | Next.js | **Vercel** | User interface for all roles. |
| **Auth & Security** | Firebase | **Google Cloud** | Identity Management & Role Storage. |
| **Blockchain Service** | Node.js | **Railway** | Manages Custodial Wallets & Polygon transactions. |
| **IoT Service** | Go | **Railway** | Ingests sensor data & alerts. |
| **Passport Service** | Go | **Railway** | Digital Passport API. |
| **Database** | PostgreSQL | **Railway** | Stores products, telemetry, and alerts. |

---

## 🔑 Step 1.5: Firebase & Security Setup (MANDATORY)

1.  **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/).
2.  **Enable Authentication**: 
    *   Enable **Google** as a Sign-in provider.
    *   Add Authorized Domains: `localhost`, `[your-site].vercel.app`.
3.  **Enable Firestore**:
    *   Create a database in "Production Mode".
    *   **Apply Security Rules**: Copy the content of `firestore.rules` from the project root and paste it into the Firebase Console -> Firestore -> Rules.
4.  **Register Web App**: Add a "Web App" to the project and copy the `firebaseConfig` object values.

---

## 🛠 Step 2: Backend Services (Railway)

For each service, choose **"Deploy from GitHub Repo"**, select your repo, and configure the **Root Directory** as specified.

### 1. Blockchain Service
*   **Root Directory**: `apps/backend/blockchain-service`
*   **Build Command**: `npm install && npm run build` (or default)
*   **Start Command**: `npm run start:prod`
*   **Environment Variables**:
    *   `PORT`: `3000`
    *   `RPC_URL`: `https://rpc-amoy.polygon.technology`
    *   `PRIVATE_KEY`: `[Your Funded Admin Private Key]`
    *   `LOGISTICS_KEY`: `[Logistics Private Key]`
    *   `RETAILER_KEY`: `[Retailer Private Key]`
    *   `CONTRACT_ADDRESS`: `0xE326362613F44383504b1bFA5Dd92C0Fc7D38471`

### 2. IoT Service
*   **Root Directory**: `apps/backend/iot-service`
*   **Build/Start**: Use the `Dockerfile` in the directory.
*   **Environment Variables**:
    *   `PORT`: `8081`
    *   `DATABASE_URL`: `[Your Railway DATABASE_URL]`

### 3. Passport Service
*   **Root Directory**: `apps/backend/passport-service`
*   **Build/Start**: Use the `Dockerfile` in the directory.
*   **Environment Variables**:
    *   `PORT`: `8080`
    *   `DATABASE_URL`: `[Your Railway DATABASE_URL]`

---

## 🌐 Step 3: Frontend (Vercel)

1.  Import the project in **Vercel**.
2.  **Root Directory**: `apps/frontend/portal`
3.  **Environment Variables**:
    *   You need the **Public Domains** provided by Railway for the backend services.
    *   `NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL`: `https://blockchain-service.up.railway.app/api/v1`
    *   `NEXT_PUBLIC_IOT_SERVICE_URL`: `https://iot-service.up.railway.app/api/v1`
    *   `NEXT_PUBLIC_PASSPORT_SERVICE_URL`: `https://passport-service.up.railway.app/api/v1`
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`: `...`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `...`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `...`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: `...`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: `...`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`: `...`
    *   `INTERNAL_API_KEY`: `[Shared Secret for Backend Auth]`. **CRITICAL**: Do NOT use `NEXT_PUBLIC_` prefix for this key to prevent browser exposure.

---

## 🔗 Critical Integration Checks

1.  **CORS**: Ensure your Go/Node backends allow requests from your Vercel domain (`https://[your-project].vercel.app`).
    *   *In NestJS (Blockchain)*: Update `main.ts` to allow specific origins or `*` for testing.
    *   *In Go (IoT/Passport)*: Check CORS middleware settings.

2.  **Gas Funds**: Ensure the `PRIVATE_KEY` wallet has MATIC on Polygon Amoy.

3.  **Database Connection**: Verify IoT and Passport services can reach the Postgres DB.

## 🔍 Step 4: Troubleshooting & Diagnostics

The portal includes a self-healing diagnostic suite. If you see a blank screen or errors, open the **Browser Console (F12)** and look for:

1.  **`[GFTB-DIAGNOSTIC]`**: This will flag exactly which environment variables are missing from the Vercel configuration.
2.  **`[GFTB-HYDRATION]`**: Confirms if the React client-side has successfully taken over from the server.
3.  **`MISSING_MESSAGE: NotFound`**: Indicates that translations for the 404 page are missing (ensure `messages/*.json` are updated).

### Common Fixes:
*   **Redirect Loops**: Ensure Vercel's `NEXT_PUBLIC_*_URL` variables do not end with a trailing slash unless handled by the proxy logic.
*   **404 on /new paths**: This is usually a hydration mismatch. Verify that `src/app/layout.tsx` is kept minimal and doesn't conflict with localized layouts.
