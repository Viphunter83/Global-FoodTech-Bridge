export interface BatchDetails {
    id: string;
    manufacturer_id: string;
    product_type: string;
    batch_size: number;
    created_at: string;
    min_temp?: number | null;
    max_temp?: number | null;
    ingredients?: { en: string; ar: string; ru: string };
    nutrition?: { calories: number; protein: number; fat: number; carbs: number };
    halal_cert_url?: string;
    manufacturer_name?: string;
    history?: {
        stage: string;
        location: string;
        timestamp: string;
        status: 'completed' | 'current' | 'future';
        icon: 'package' | 'truck' | 'warehouse' | 'fork';
    }[];
}

export interface Telemetry {
    timestamp: string;
    temperature_celsius: number;
    location_lat?: number;
    location_lon?: number;
    device_id: string;
}

export interface BlockchainStatus {
    status: string;
    txHash?: string;
    verified: boolean;
    handover?: boolean;
    violation?: string | null;
    pendingOwner?: string | null;
}

export interface Alert {
    id: string;
    batch_id: string;
    type: string;
    message: string;
    created_at: string;
}

const isServer = typeof window === 'undefined';

const PASSPORT_URL = isServer
    ? (process.env.PASSPORT_SERVICE_URL || 'http://passport-service:8080/api/v1')
    : 'http://localhost:8080/api/v1';

const IOT_URL = isServer
    ? (process.env.IOT_SERVICE_URL || 'http://iot-service:8081/api/v1')
    : 'http://localhost:8081/api/v1';

const BLOCKCHAIN_URL = isServer
    ? (process.env.BLOCKCHAIN_SERVICE_URL || 'http://blockchain-service:3000/api/v1')
    : 'http://localhost:3000/api/v1';

// --- DEMO MOCK STATE ---
// This allows the UI to actually change state during a demo session without a real backend
let DEMO_STATE = {
    verified: true, // Started as Verified for initial view
    handover: false,
    violation: null as string | null,
    pendingOwner: null as string | null,
    status: 'Notarized'
};

export function resetDemoState() {
    DEMO_STATE = {
        verified: true,
        handover: false,
        violation: null,
        pendingOwner: null,
        status: 'Notarized'
    };
}
// -----------------------

export async function getBatchDetails(id: string): Promise<BatchDetails | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/batches/${id}`, { cache: 'no-store' });
        // if (!res.ok) return null; // Fallback to mock data below
        const data = res.ok ? await res.json() : {};

        // Mock extended data for MVP if missing
        return {
            ...data,
            ingredients: data.ingredients || {
                en: "Premium Beef (80%), Rice Noodles, Spices, Sea Salt.",
                ar: "لحم بقري ممتاز (80٪) ، نودلز أرز ، بهارات ، ملح البحر.",
                ru: "Говядина премиум (80%), Рисовая лапша, Специи, Морская соль."
            },
            nutrition: data.nutrition || { calories: 450, protein: 35, fat: 12, carbs: 55 },
            halal_cert_url: data.halal_cert_url || "/certificates/halal-Cert-2024.pdf",
            manufacturer_name: "Bun Cha Ha Noi Factory",
            history: [
                { stage: "Produced & Packed", location: "Hanoi, Vietnam", timestamp: "Fri, 10 Oct • 08:30", status: "completed", icon: "package" },
                { stage: "Quality Check (AI)", location: "Factory Line 1", timestamp: "Fri, 10 Oct • 09:15", status: "completed", icon: "warehouse" },
                { stage: "Cold Chain Logistics", location: "Global Transit", timestamp: "Sat, 11 Oct • 14:00", status: "completed", icon: "truck" },
                { stage: "Arrived at Hub", location: "Dubai, UAE", timestamp: "Today • 07:45", status: "current", icon: "warehouse" },
                { stage: "Ready for Kitchen", location: "Restaurant", timestamp: "Est. Tomorrow", status: "future", icon: "fork" }
            ]
        };
    } catch (e) {
        console.error('Failed to fetch batch details:', e);
        return null;
    }
}

export async function getTelemetry(id: string): Promise<Telemetry[]> {
    try {
        const res = await fetch(`${IOT_URL}/telemetry/${id}`, { cache: 'no-store' });

        let data = [];
        if (res.ok) {
            data = await res.json();
        }

        // MOCK: If no real data, generate realistic "Sales" curve for demo
        // Force mock data for consistency during verification step
        if (!data || data.length === 0) {
            const now = Date.now();
            const mockData: Telemetry[] = [];
            // Generate 24 hours of data (every 15 mins)
            for (let i = 0; i < 96; i++) {
                const time = now - (i * 15 * 60 * 1000);
                // "Sawtooth" pattern: compressor cycling between -22 and -19
                // i % 8 creates a cycle every 2 hours
                const cycle = (i % 8);
                let temp = -22 + (cycle * 0.4);

                // Inject specific "events" for TTI testing
                // Event 1: Defrost Cycle (Short spike) at index 20 (~5 hours ago)
                if (i === 20) temp = -12;
                if (i === 19) temp = -14;

                // Event 2: Start/Stop Loading (Medium spike) at index 60 (~15 hours ago)
                if (i >= 58 && i <= 62) temp = -15;

                mockData.push({
                    timestamp: new Date(time).toISOString(),
                    temperature_celsius: parseFloat(temp.toFixed(1)),
                    device_id: "dev_01",
                    location_lat: 45.7 + (Math.random() * 0.01),
                    location_lon: 4.8 + (Math.random() * 0.01)
                });
            }
            return mockData.reverse();
        }

        return data;
    } catch (e) {
        console.warn('Failed to fetch telemetry, using mock:', e);
        // Fallback Mock Logic (Copy of above for error case)
        const now = Date.now();
        const mockData: Telemetry[] = [];
        for (let i = 0; i < 96; i++) {
            const time = now - (i * 15 * 60 * 1000);
            const cycle = (i % 8);
            let temp = -22 + (cycle * 0.4);
            if (i === 20) temp = -12;
            if (i === 19) temp = -14;
            if (i >= 58 && i <= 62) temp = -15;
            mockData.push({
                timestamp: new Date(time).toISOString(),
                temperature_celsius: parseFloat(temp.toFixed(1)),
                device_id: "dev_01",
                // Random drift around Lyon coordinates
                location_lat: 45.75 + (Math.random() * 0.05),
                location_lon: 4.85 + (Math.random() * 0.05)
            });
        }
        return mockData.reverse();
    }
}

export async function getBlockchainStatus(id: string): Promise<BlockchainStatus> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/status/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            return { status: 'Pending', verified: false };
        }

        // DEMO OVERRIDE: Force verification for specific demo batches
        if (id === '902f1e4c-3861-458d-8e76-7054b86c0cf1' || id === 'batch-123') {
            return {
                status: 'Notarized',
                verified: true,
                handover: false,
                violation: null,
                pendingOwner: null
            };
        }

        const data = await res.json();
        // data = { exists: boolean, txHash?: string, timestamp?: number }

        return {
            status: data.exists ? 'Notarized' : 'Pending',
            verified: data.exists,
            txHash: data.txHash,
            handover: data.handover,
            violation: data.violation,
            pendingOwner: data.pendingOwner
        };
    } catch (e) {
        console.error('Failed to fetch blockchain status:', e);
        // DEMO OVERRIDE: If backend is down, still show "Verified" for the demo batch to allow UI testing
        if (id === '902f1e4c-3861-458d-8e76-7054b86c0cf1' || id === 'batch-123') {
            return { status: 'Notarized', verified: true };
        }
        return { status: 'Error', verified: false };
    }
}

export async function getAlerts(id: string): Promise<Alert[]> {
    try {
        const res = await fetch(`${IOT_URL}/telemetry/${id}/alerts`, { cache: 'no-store' });

        let data = [];
        if (res.ok) {
            data = await res.json();
        }

        // MOCK: Smart Alerts matching the "Sawtooth" telemetry story
        // Fallback if no real alerts are found (MVP/Demo mode)
        if (!data || data.length === 0) {
            return [
                {
                    id: "alert_01",
                    batch_id: id,
                    type: "WARNING",
                    message: "Defrost Cycle Detected (-12°C for 15m)",
                    created_at: new Date(Date.now() - (5 * 60 * 60 * 1000)).toISOString() // 5 hours ago
                },
                {
                    id: "alert_02",
                    batch_id: id,
                    type: "WARNING",
                    message: "Temp Deviation: Loading Dock (-15°C for 45m)",
                    created_at: new Date(Date.now() - (15 * 60 * 60 * 1000)).toISOString() // 15 hours ago
                }
            ];
        }

        return data;
    } catch (e) {
        console.warn('Failed to fetch alerts, falling back to mock:', e);
        // Fallback on error
        return [
            {
                id: "alert_01",
                batch_id: id,
                type: "WARNING",
                message: "Defrost Cycle Detected (-12°C for 15m)",
                created_at: new Date(Date.now() - (5 * 60 * 60 * 1000)).toISOString() // 5 hours ago
            },
            {
                id: "alert_02",
                batch_id: id,
                type: "WARNING",
                message: "Temp Deviation: Loading Dock (-15°C for 45m)",
                created_at: new Date(Date.now() - (15 * 60 * 60 * 1000)).toISOString() // 15 hours ago
            }
        ];
    }
}

export async function notarizeBatch(batchId: string, dataHash: string = "hash"): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/notarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId, dataHash }),
            cache: 'no-store'
        });

        if (!res.ok) {
            return { status: 'error', error: 'Failed to notarize' };
        }

        return await res.json();
    } catch (e) {
        console.error('Failed to notarize batch:', e);
        // DEMO OVERRIDE
        if (batchId === '902f1e4c-3861-458d-8e76-7054b86c0cf1' || batchId === 'batch-123') {
            return { status: 'success', txHash: '0x_demo_hash_' + Date.now() };
        }
        return { status: 'error', error: String(e) };
    }
}

export async function initiateHandover(batchId: string, toAddress: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/transfer/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId, toAddress }),
            cache: 'no-store'
        });

        if (!res.ok) {
            return { status: 'error', error: 'Failed to initiate handover' };
        }
        return await res.json();
    } catch (e) {
        console.error('Failed to initiate handover', e);
        // DEMO OVERRIDE
        if (batchId === '902f1e4c-3861-458d-8e76-7054b86c0cf1' || batchId === 'batch-123') {
            return { status: 'success', txHash: '0x_demo_handover_' + Date.now() };
        }
        return { status: 'error', error: String(e) };
    }
}

export async function acceptHandover(batchId: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/transfer/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId }),
            cache: 'no-store'
        });

        if (!res.ok) {
            return { status: 'error', error: 'Failed to accept handover' };
        }
        return await res.json();
    } catch (e) {
        console.error('Failed to accept handover', e);
        // DEMO OVERRIDE
        if (batchId === '902f1e4c-3861-458d-8e76-7054b86c0cf1' || batchId === 'batch-123') {
            return { status: 'success', txHash: '0x_demo_accept_' + Date.now() };
        }
        return { status: 'error', error: String(e) };
    }
}

export async function reportViolation(batchId: string, details: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/violation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId, details }),
            cache: 'no-store'
        });

        if (!res.ok) {
            return { status: 'error', error: 'Failed to report violation' };
        }
        return await res.json();
    } catch (e) {
        console.error('Failed to report violation', e);
        // DEMO OVERRIDE
        if (batchId === '902f1e4c-3861-458d-8e76-7054b86c0cf1' || batchId === 'batch-123') {
            return { status: 'success', txHash: '0x_demo_violation_' + Date.now() };
        }
        return { status: 'error', error: String(e) };
    }
}
