export interface BatchDetails {
    id: string;
    manufacturer_id: string;
    product_type: string;
    batch_size: number;
    created_at: string;
    min_temp?: number | null;
    max_temp?: number | null;
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
}

export interface Alert {
    id: string;
    batch_id: string;
    type: string;
    message: string;
    created_at: string;
}

const PASSPORT_URL = process.env.PASSPORT_SERVICE_URL || 'http://passport-service:8080/api/v1';
const IOT_URL = process.env.IOT_SERVICE_URL || 'http://iot-service:8081/api/v1';
const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://blockchain-service:3000/api/v1';

export async function getBatchDetails(id: string): Promise<BatchDetails | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/batches/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error('Failed to fetch batch details:', e);
        return null;
    }
}

export async function getTelemetry(id: string): Promise<Telemetry[]> {
    try {
        const res = await fetch(`${IOT_URL}/telemetry/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            console.warn(`IoT Service returned ${res.status}`);
            return [];
        }
        const data = await res.json();
        return data || [];
    } catch (e) {
        console.error('Failed to fetch telemetry:', e);
        return [];
    }
}

export async function getBlockchainStatus(id: string): Promise<BlockchainStatus> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/status/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            return { status: 'Pending', verified: false };
        }

        const data = await res.json();
        // data = { exists: boolean, txHash?: string, timestamp?: number }

        return {
            status: data.exists ? 'Notarized' : 'Pending',
            verified: data.exists,
            txHash: data.txHash,
            handover: data.handover,
            violation: data.violation
        };
    } catch (e) {
        console.error('Failed to fetch blockchain status:', e);
        return { status: 'Error', verified: false };
    }
}

export async function getAlerts(id: string): Promise<Alert[]> {
    try {
        const res = await fetch(`${IOT_URL}/telemetry/${id}/alerts`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data || [];
    } catch (e) {
        console.error('Failed to fetch alerts:', e);
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
            return { status: 'error', error: 'Failed to notarize' };
        }

        return await res.json();
    } catch (e) {
        console.error('Failed to notarize batch:', e);
        return { status: 'error', error: String(e) };
    }
}

export async function finalizeHandover(batchId: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/handover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId }),
            cache: 'no-store'
        });

        if (!res.ok) {
            return { status: 'error', error: 'Failed to hand over' };
        }
        return await res.json();
    } catch (e) {
        console.error('Failed to finalize handover', e);
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
        return { status: 'error', error: String(e) };
    }
}
