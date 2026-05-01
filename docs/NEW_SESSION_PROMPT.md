# Global FoodTech Bridge - Next Session Context

## 🚀 Current Project State (End of Session 5)
The project has undergone a massive architecture and UI/UX refactoring to bring it to production-grade standards.

### 🏗 Architecture Overhaul
- **Domain-Driven Components**: Components moved from `src/components/ui` to specialized folders:
  - `blockchain/`: Blockchain controls, proofs, and transaction states.
  - `passport/`: Digital twin elements (sustainability, journey, certificates).
  - `maps/`: Interactive Route and Dashboard maps.
  - `shared/`: Generic premium elements (tooltips, empty states).
  - `layout/`: Language/Role switchers.
- **SSR/SEO Optimization**: Critical pages converted to Server Components:
  - `/dashboard`: Hybrid SSR for layout, Client for live telemetry.
  - `/verify/[id]`: Fully SEO-optimized with dynamic OpenGraph metadata.
  - `/scan/[id]`: Operational portal for logistics with SSR verification check.
  - `/admin/sensors`: Server-side initial data fetch for faster load.

### 💎 UI/UX Standards
- **Design System**: Consistent use of Serif fonts (for titles), `rounded-[3rem]`, and Glassmorphism.
- **Loading UX**: Skeleton states (`loading.tsx`) implemented for all primary routes.
- **Feedback**: `sonner` toasts integrated for all blockchain and API operations.

### 🛠 Infrastructure
- **Unified Deployment**: Removed redundant Vercel projects. Active URL: `https://global-food-tech-bridge.vercel.app/en`.
- **API Strategy**: Using `INTERNAL_API_KEY` for server-side fetches and Firebase Auth for client-side operations.

## 📋 Outstanding Tasks / Next Steps
1.  **Admin Panel Deep Audit**:
    - Systematically go through each section of the `/admin` subtree.
    - Ensure all forms use Shadcn components (not raw HTML).
    - Implement "Edit" functionality for Companies and Protocols (currently mostly "Create").
2.  **Analytics Page Refactor**:
    - The `/admin/monitoring` and other analytics pages need to be connected to the real `iot-service` analytics endpoints.
3.  **Localization Audit**:
    - Check for hardcoded strings in the new components (specifically in the new `Client` wrappers).
4.  **Mobile App PWA**:
    - Finalize manifest and offline capabilities for the logistics `ScanPage`.

## ⚠️ Guidelines for the AI Assistant
- **Absolute Imports**: Always use `@/` for imports.
- **Component Placement**: Do NOT put business logic components in `src/components/ui`. Use the domain-specific folders.
- **SSR First**: Aim for Server Components by default. Use `"use client"` only for interactivity.
- **Premium Aesthetics**: Maintain the "Premium" look (spacing, typography, subtle shadows).
