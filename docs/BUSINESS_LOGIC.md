# Global FoodTech Bridge - Business Logic Specification

This document defines the core operational logic of the platform, ensuring transparency and trust across international supply chains.

## 🔗 Supply Chain Roles & Entities

| Role | Key Responsibility | Business Value |
| :--- | :--- | :--- |
| **Manufacturer** | Create Product Passports (Batches) | Origin proof, quality at source |
| **Logistics** | Maintain Cold Chain / Transit | Condition integrity during transport |
| **Retailer/Buyer** | Accept Ownership (Handover) | Official inventory entry, proof of receipt |
| **Consumer** | Verify Lifecycle via QR | 100% Transparency & Trust |

---

## 🆔 Identity & Trust Layer (GS1 & Legal)

To ensure the highest level of trust in a global supply chain, every entity on the platform is bound by three layers of identification:

1.  **Legal Identity (NAT/VAT)**: National tax identifiers used for government-level verification and customs clearance.
2.  **Global Supply Chain Identity (GS1 GLN)**: The **Global Location Number** (13 digits) serves as a unique "digital address" for physical facilities. This allows cross-referencing with the GS1 Global Registry.
3.  **Digital Cryptographic Identity (Blockchain Wallet)**: Every registered enterprise possesses a unique non-custodial wallet. All actions (batch creation, handovers) are cryptographically signed by this identity.

### Registration Flow:
*   **Initialization**: Admin or self-service portal creates a `Company` record with GLN and VAT details.
*   **Wallet Binding**: The system generates a wallet and stores it alongside the legal IDs.
*   **Role Authorization**: A smart contract transaction grants the `MANUFACTURER`, `LOGISTICS`, or `RETAILER` role to the wallet address only after legal verification is complete.

---

## 🚀 Phase 1: Preparation & Production (Origin)
### Workflow:
1. **Batch Creation**: Manufacturer initiates a batch in the `Passport Service`.
2. **Metadata Ingestion**:
    *   **Origin Data**: Production date, location (lat/lon), and initial certificates.
    *   **SLA Policy**: Define temperature limits (e.g., -20°C to -18°C) for the cold chain.
3. **Blockchain Notarization**: The batch hash is notarized on the private/public chain to prevent retroactive data tampering.

---

## 🚛 Phase 2: Global Logistics & IoT (Transit)
### Workflow:
1. **Sensor Pairing**: A unique IoT device ID is paired with the batch ID.
2. **Real-time Monitoring**:
    *   **Telemetry**: IoT sensors push temperature and GPS data every 15 mins.
    *   **SLA Violations**: If temperature exceeds limits, an `Alert` is auto-generated.
3. **Customs & Borders**:
    *   Transit stage updates (e.g., "Arrived at Hai Phong Port", "Cleared Customs").
    *   **Multi-country Logic**: The system automatically labels the "Origin" and "Destination" routing based on the initial batch setup.

---

## 🤝 Phase 3: Financial & Legal Handover (Reception)
### Workflow:
1. **Ownership Transfer (Smart Contract)**:
    *   The current owner (Logistics) initiates a `Transfer Request` in the Blockchain Service.
    *   The pending owner (Retailer) reviews the IoT history (SLA Compliance).
    *   **Acceptance**: If logs are clean, the Retailer clicks "Accept Handover".
2. **Trust Index Verification**:
    *   A "Trust Index" score is generated for every batch based on sensor uptime and SLA compliance.

---

## 🔭 Points of Growth (Roadmap Specifications)

### 1. Supply Chain Templates (Universal Adaptability)
*   **Logic**: Instead of a hardcoded "Produced -> Logistics -> Retail" flow, we introduce **Step Blueprints**.
*   **Owner-level customization**: Manufacturers can define a "Mango Export Template" with an extra "Vapor Heat Treatment" step.
*   **Validation**: Each step can require a specific IPFS certificate (e.g., Phytosanitary certificate for plants).

### 2. Multilingual Data Layers (Local Context)
*   **Logic**: Data records in the database will support a `translation_map` structure.
*   **UI Integration**: If a user switches the language to Arabic, the API returns the Arabic version of labels (e.g., Stage Names, Ingredients) stored in the DB, not just in the frontend `lib/translations.ts`.

### 3. Financial Escrow System (Secure Trade)
*   **Logic**: Blockchain-based escrow.
*   **Workflow**:
    1. Buyer deposits funds into a smart contract upon batch creation.
    2. Logistics completes delivery.
    3. Trigger: `Accept Handover` automatically releases 90% of funds.
    4. Safety: If an SLA Violation occurred, 10% is held until a human arbiter (Admin) reviews the "Platform Infrastructure Monitoring" logs.

### 4. Global Compliance Module (Automated Auditing)
*   **Logic**: A rules engine that matches `DestinationCountry` with global import requirements.
*   **Example**: If Destination is "United Arab Emirates", the system blocks `Accept Handover` until a verified `Halal Certificate` has been uploaded to IPFS.

---

## 📊 Infrastructure Monitoring & Reliability
To support a global economy, the platform uptime is audited via the `InfrastructureStatus` dashboard, ensuring that the critical "Trust Gateway" (Railway API & Blockchain Nodes) is always operational for international partners.
