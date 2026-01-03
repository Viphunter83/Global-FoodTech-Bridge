# 🚀 Global FoodTech Bridge - Deployment Guide

This guide helps you deploy the project to **Railway** (Backend & Database) and **Vercel** (Frontend).

## 🏗 System Architecture

The project consists of 5 main components:

| Service | Type | Hosting | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Portal** | Next.js | **Vercel** | User interface for all roles. |
| **Blockchain Service** | Node.js | **Railway** | Manages Custodial Wallets & Polygon transactions. |
| **IoT Service** | Go | **Railway** | Ingests sensor data & alerts. |
| **Passport Service** | Go | **Railway** | Digital Passport API. |
| **Database** | PostgreSQL | **Railway** | Stores products, telemetry, and alerts. |

---

## 📋 Step 1: Database Setup (Railway)

1.  Create a **New Project** on Railway.
2.  Add a **PostgreSQL** database service.
3.  Copy the `DATABASE_URL` (Connection String).
4.  **Initialize Schema**:
    *   Connect to the DB using a tool like TablePlus or PgAdmin.
    *   Run the schema scripts found in `packages/database/schema.sql` (if available) or export your local schema.
    *   *Note: Ensure PostgREST is enabled if you use it, or switch IoT/Passport to use direct DB connections.*

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
    *   `DB_DSN`: `[Your Railway DATABASE_URL]`

### 3. Passport Service
*   **Root Directory**: `apps/backend/passport-service`
*   **Build/Start**: Use the `Dockerfile` in the directory.
*   **Environment Variables**:
    *   `PORT`: `8080`
    *   `DB_DSN`: `[Your Railway DATABASE_URL]`

---

## 🌐 Step 3: Frontend (Vercel)

1.  Import the project in **Vercel**.
2.  **Root Directory**: `apps/frontend/portal`
3.  **Environment Variables**:
    *   You need the **Public Domains** provided by Railway for the backend services.
    *   `NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL`: `https://[blockchain-service].railway.app/api/v1`
    *   `NEXT_PUBLIC_IOT_SERVICE_URL`: `https://[iot-service].railway.app/api/v1`
    *   `NEXT_PUBLIC_PASSPORT_SERVICE_URL`: `https://[passport-service].railway.app/api/v1`

---

## 🔗 Critical Integration Checks

1.  **CORS**: Ensure your Go/Node backends allow requests from your Vercel domain (`https://[your-project].vercel.app`).
    *   *In NestJS (Blockchain)*: Update `main.ts` to allow specific origins or `*` for testing.
    *   *In Go (IoT/Passport)*: Check CORS middleware settings.

2.  **Gas Funds**: Ensure the `PRIVATE_KEY` wallet has MATIC on Polygon Amoy.

3.  **Database Connection**: Verify IoT and Passport services can reach the Postgres DB.
