# 🌐 Global FoodTech Bridge - Portal (Frontend)

Modern, high-performance supply chain transparency portal built with **Next.js 14**, **Tailwind CSS**, and **Firebase**.

## 🚀 Key Features

- **Expert Layout Architecture**: Zero-hydration-error layout system with dynamic SEO `lang` support.
- **Multilingual Support**: Fully localized with `next-intl` (English, Russian, Arabic, Vietnamese).
- **Blockchain Verification**: Real-time notarization status and supply chain history from Polygon.
- **IoT Integration**: Live telemetry charts and threshold alerts.
- **Enterprise UI**: Custom high-fidelity components built with Lucide icons and harmonized HSL color palettes.

## 🏗 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS / Vanilla CSS
- **State Management**: React Context (DemoMode, Auth, Internationalization)
- **Identity**: Firebase Auth (Google Sign-In)
- **Database**: Firebase Firestore (Metadata & Roles) + Railway PostgreSQL (Telemetry & Business Logic)

## 🛠 Strategic Patterns

### Expert Layout Pattern
To ensure stability in production, we use a **Minimal Root Layout** (`src/app/layout.tsx`) that simply acts as a pass-through. The core document structure (`<html>`, `<body>`) and global fonts are defined within the **Localized Layout** (`src/app/[locale]/layout.tsx`).
- **Benefit**: No nested `HTML` tags, full SEO control over `lang` attribute, and no hydration flickering.

### Security Hardening
Administrative keys use the `INTERNAL_API_KEY` environment variable. 
- **Rule**: These variables lack the `NEXT_PUBLIC_` prefix, ensuring they stay on the Vercel server and are never exposed to the client.

## 📖 Deployment

The portal is optimized for **Vercel**.
- **Build Command**: `npm run build`
- **Output**: `standalone` (for high-efficiency serving)

For environment variables details, see the root [DEPLOYMENT.md](../../../DEPLOYMENT.md).

## 🔍 Diagnostics

Developing on this portal is assisted by:
- `[GFTB-DIAGNOSTIC]`: Console logging tool to check env var availability.
- `[GFTB-HYDRATION]`: Monitor React initialization state.
