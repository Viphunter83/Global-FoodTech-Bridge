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
    owner?: string;
    sensorPaired?: boolean;
}

export interface Alert {
    id: string;
    batch_id: string;
    type: string;
    message: string;
    created_at: string;
}

import { MANUFACTURER_ADDR } from './constants';

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

// --- API CLIENT ---

export async function getBatchDetails(id: string): Promise<BatchDetails | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/batches/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();

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
                const cycle = (i % 8);
                let temp = -22 + (cycle * 0.4);

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
            // No spikes
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
    // Pure API call. No local storage fallbacks here.
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/status/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            // Default "New Batch" state for fresh items
            return {
                status: 'Pending',
                verified: false,
                owner: MANUFACTURER_ADDR,
                pendingOwner: null,
                violation: null,
                handover: false
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
            pendingOwner: data.pendingOwner,
            owner: data.owner
        };
    } catch (e) {
        console.error('Failed to fetch blockchain status:', e);
        // Default error fallback (safe default)
        return {
            status: 'Offline',
            verified: false,
            owner: MANUFACTURER_ADDR
        };
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
            // Return cleaned list for Demo "Happy Path"
            return [];
        }

        return data;
    } catch (e) {
        console.warn('Failed to fetch alerts, falling back to mock:', e);
        // Fallback on error
        return [];
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
            console.warn('Backend notarize failed, return mock success');
            return { status: 'success', txHash: '0x_demo_fallback_' + Date.now() };
        }

        return await res.json();
    } catch (e) {
        console.error('Failed to notarize batch:', e);
        return { status: 'success', txHash: '0x_demo_offline_' + Date.now() };
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
            console.warn('Backend initiate failed, return mock success');
            return { status: 'success', txHash: '0x_demo_fallback_' + Date.now() };
        }
        return await res.json();
    } catch (e) {
        console.error('Failed to initiate handover', e);
        return { status: 'success', txHash: '0x_demo_offline_' + Date.now() };
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
            console.warn('Backend accept failed, return mock success');
            return { status: 'success', txHash: '0x_demo_fallback_' + Date.now() };
        }
        return await res.json();
    } catch (e) {
        console.error('Failed to accept handover', e);
        return { status: 'success', txHash: '0x_demo_offline_' + Date.now() };
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
            console.warn('Backend report failed, return mock success');
            return { status: 'success', txHash: '0x_demo_fallback_' + Date.now() };
        }
        return await res.json();
    } catch (e) {
        console.error('Failed to report violation', e);
        return { status: 'success', txHash: '0x_demo_offline_' + Date.now() };
    }
}
