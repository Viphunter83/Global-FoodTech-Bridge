# MCP Infrastructure Guide & Project Identity

> [!IMPORTANT]
> **This is the Source of Truth for Project Connectivity.** Any AI agent starting a new session MUST read this to establish cloud connections.

## 🔑 Project Identity & Auth Mapping

To prevent integration difficulties, use these absolute paths and identifiers:

| Service | Project ID / Scope | Credential Source | Path / Key |
| :--- | :--- | :--- | :--- |
| **Firebase (Prod)** | `global-foodtech-bridge-prod` | Admin SDK JSON | `/Users/apple/Documents/global-foodtech-bridge-prod-firebase-adminsdk-fbsvc-70d33782fb.json` |
| **Vercel** | `global-food-tech-bridge` | Personal Access Token | Required in `env.VERCEL_TOKEN` |
| **Railway** | `Global FoodTech Bridge` | Railway Token | Required in `env.RAILWAY_TOKEN` |
| **PostgreSQL** | `passport-db` | Railway Managed | Managed via Railway MCP |
| **Blockchain** | Polygon Mainnet | Internal API Key | `INTERNAL_API_KEY` (Sync between Vercel/Railway) |

---

## 🛠 Active MCP Servers

### 1. Vercel (Custom Bridge)
Used for frontend deployments and environment sync.
- **Path**: `/Users/apple/.gemini/antigravity/mcp-servers/vercel/index.js`
- **Requirement**: Must have `VERCEL_TOKEN` to list/deploy projects.

### 2. Railway (Infrastructure Control)
Used for backend logs, service health, and variable management.
- **Path**: `/Users/apple/.gemini/antigravity/mcp-servers/railway/node_modules/@railway/mcp-server/dist/index.js`

### 3. Firebase (Admin Control)
Used for user role management and database overrides.
- **Method**: `npx -y firebase-tools@latest mcp`
- **Auth**: Always use the **Admin SDK JSON** path from the table above for `admin.initializeApp()`.

---

## 🛠 Administrative & Troubleshooting Procedures

### 1. Fixing User Roles (The "403 Forbidden" Fix)
If a user is `PENDING` and needs to be `MANUFACTURER`:
1. Use the script in `apps/frontend/portal/fix-role.js`.
2. Ensure it points to the JSON key in `/Users/apple/Documents/`.
3. Run: `cd apps/frontend/portal && node fix-role.js`.

### 2. IPFS Multipart Fix
If certificate uploads fail, check the Vercel Proxy:
- **File**: `apps/frontend/portal/src/app/api/blockchain/[...path]/route.ts`.
- **Logic**: It must NOT override `Content-Type` to `application/json` for multipart requests.

### 3. Syncing Internal API Keys
If you see `401 Unauthorized` between services:
1. Check `INTERNAL_API_KEY` in Railway (Passport/Blockchain services).
2. Check `INTERNAL_API_KEY` in Vercel (Environment Variables).
3. They MUST be identical.

---

## ⚡ Quick Verification Command
`mcp_railway_check-railway-status` && `mcp_firebase-mcp-server_firebase_get_project`


## 🌐 Frontend Architecture (Refactored May 2026)

The frontend has been migrated to a **Domain-Driven SSR** architecture to ensure production-grade performance and premium aesthetics.

### Key Directories
- `src/components/blockchain`: Governance and transaction UI.
- `src/components/passport`: Consumer-facing digital twin components.
- `src/components/maps`: Multi-layer interactive maps.
- `src/components/ui`: Generic shadcn primitives (DO NOT place business logic here).

### Rendering Strategy
- **SSR-First**: Pages like `/verify/[id]`, `/scan/[id]`, and `/dashboard` are Server Components. 
- **Hybrid Interactivity**: Server-side data fetching + Client-side polling for live IoT/Blockchain status.

### Deployment
- **Main URL**: [https://global-food-tech-bridge.vercel.app/en](https://global-food-tech-bridge.vercel.app/en)
- **Automatic Deploys**: Push to `main` branch triggers auto-deploy to Vercel and Railway.

---

## 🛡 Security & Role-Based Access (RBAC)
To prevent cross-participant interference, the **Next.js API Routes** act as a security proxy:
- **Proxy Location**: `apps/frontend/portal/src/app/api/blockchain/[...path]/route.ts`
- **Logic**: It verifies the user's role from the Firebase JWT and compares it against a `ROLE_PERMISSIONS` map before forwarding requests to the `blockchain-service`.
- **Superadmin**: Users with the `ADMIN` role have full access (`*`) to all endpoints, including demo/reset controls.
- **Enforcement Rules**:
    - `MANUFACTURER`: Access to `/notarize`, `/transfer/initiate`, `/violation`.
    - `LOGISTICS`: Access to `/transfer/accept`, `/transfer/initiate`, `/violation`.
    - `RETAILER`: Access to `/transfer/accept`, `/violation`.
