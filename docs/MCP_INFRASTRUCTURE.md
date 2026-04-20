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

## Configuration Template (`mcp_config.json`)

To restore these connections in a new assistant session, ensure your `mcp_config.json` contains the following:

```json
{
  "mcpServers": {
    "firebase-mcp-server": {
      "command": "/opt/homebrew/bin/npx",
      "args": ["-y", "firebase-tools@latest", "mcp"],
      "env": { "PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" }
    },
    "railway": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/Users/apple/.gemini/antigravity/mcp-servers/railway/node_modules/@railway/mcp-server/dist/index.js"],
      "env": {
        "PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
        "HOME": "/Users/apple",
        "RAILWAY_CONFIG_DIR": "/Users/apple/.railway"
      }
    },
    "vercel": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/Users/apple/.gemini/antigravity/mcp-servers/vercel/index.js"],
      "env": {
        "VERCEL_TOKEN": "[PROVIDED_BY_USER_OR_KEPT_IN_CONFIG]"
      }
    }
  }
}
```

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
