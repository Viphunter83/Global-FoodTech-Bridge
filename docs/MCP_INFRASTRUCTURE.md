# MCP Infrastructure Guide

This document describes how to set up and manage the Model Context Protocol (MCP) integrations for the Global FoodTech Bridge platform. These integrations allow AI assistants to directly interact with Vercel (Frontend), Railway (Backend), and Firebase (Auth/DB).

## Active MCP Servers

### 1. Vercel (Management API)
Allows managing deployments, environment variables, and project settings for the frontend portal.

> [!IMPORTANT]
> **Custom Bridge Required**: Due to environment restrictions, we use a custom bridge script instead of the default `npx` command.

- **Command**: `/opt/homebrew/bin/node`
- **Args**: `["/Users/apple/.gemini/antigravity/mcp-servers/vercel/index.js"]`
- **Bridge Path**: `/Users/apple/.gemini/antigravity/mcp-servers/vercel/index.js`
- **Auth**: Requires `VERCEL_TOKEN` in the `env` section.

### 2. Railway (Backend & Infrastructure)
Used for monitoring microservices, checking deployment logs, and managing backend variables.

> [!NOTE]
> We use a direct path to the `@railway/mcp-server` package to bypass `npx` pathing issues on macOS.

- **Command**: `/opt/homebrew/bin/node`
- **Args**: `["/Users/apple/.gemini/antigravity/mcp-servers/railway/node_modules/@railway/mcp-server/dist/index.js"]`
- **Dependencies**: Installed in `/Users/apple/.gemini/antigravity/mcp-servers/railway/`

### 3. Firebase (Identity & Storage)
Provides tools for user management and Firestore/Storage administration.

- **Command**: `/opt/homebrew/bin/npx`
- **Args**: `["-y", "firebase-tools@latest", "mcp"]`

---

## 🛠 Administrative & Troubleshooting Procedures
 
 ### 1. User Role Management (Firestore)
 If a user encounters a `403 Forbidden` error when creating a batch, verify their role in Firestore.
 - **Collection**: `users`
 - **Document ID**: User's Firebase UID.
 - **Required Fields**: `role` (must be `MANUFACTURER` or `ADMIN`).
- **Fix Tool**: Use a Node.js script with the **Firebase Admin SDK** (stored in `/Users/apple/Documents/`).
 
 ### 2. Debugging IPFS / Certificate Uploads
 Certificate uploads pass through a proxy: `Portal (Vercel) -> Blockchain Service (Railway) -> Pinata (IPFS)`.
 - **Common Failure**: Forcing `application/json` in the proxy breaks `multipart/form-data`. 
 - **Verification**: Ensure `apps/frontend/portal/src/app/api/blockchain/[...path]/route.ts` correctly detects and forwards the `Content-Type`.
 
 ### 3. Internal Security (`INTERNAL_API_KEY`)
 All cross-service requests must include the `x-api-key` header.
 - **Frontend**: The proxy route automatically injects this from `process.env.INTERNAL_API_KEY`.
 - **Backend**: Services verify this key using `ApiKeyGuard` (NestJS) or custom middleware (Go).
 
 ---
 
 ## Configuration Template (`mcp_config.json`)
 
 ... (previous config) ...
 
 ## Maintenance & Recovery
 
 ### Connection Test
 If a server appears offline, run the following verification commands:
 - **Firebase**: `mcp_firebase-mcp-server_firebase_get_project`
 - **Railway**: `mcp_railway_check-railway-status`
 - **Vercel**: `mcp_vercel_list_projects` (custom tool from bridge)
 
 ### Troubleshooting Bridge
 If the Vercel bridge fails, verify that the `@modelcontextprotocol/sdk` and `zod` are installed in the bridge directory:
 ```bash
 cd /Users/apple/.gemini/antigravity/mcp-servers/vercel
 npm install @modelcontextprotocol/sdk zod
 ```

