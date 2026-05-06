export interface BatchCertificate {
    uri: string;
    type: string;
    name: string;
}

export interface BatchDetails {
    id: string;
    manufacturer_id: string;
    product_type: string;
    batch_size: number;
    created_at: string;
    min_temp?: number | null;
    max_temp?: number | null;
    ingredients?: { en: string; ar: string; ru: string; vi: string } | string;
    nutrition?: { calories: number; protein: number; fat: number; carbs: number };
    halal_cert_url?: string;
    manufacturer_name?: string;
    token_uri?: string;
    origin_country?: string;
    destination_country?: string;
    unit_of_measure?: string;
    template_id?: string | null;
    partner_id?: string | null;
    partner_redirect_url?: string | null;
    sensor_id?: string;
    // IPFS Extended Data
    production_date?: string;
    expiration_date?: string;
    production_location?: string;
    origin_location?: string;
    certificates?: BatchCertificate[];
    trust_metrics?: {
        type: 'purity' | 'temperature' | 'carbon' | 'organic' | 'nutrition' | 'origin';
        label: string;
        value: string;
        source: 'Blockchain' | 'IoT' | 'Lab Report';
        status: 'verified' | 'warning' | 'pending';
    }[];
    history?: {
        stage: string;
        location: string;
        timestamp: string;
        status: 'completed' | 'current' | 'future';
        icon: 'package' | 'truck' | 'warehouse' | 'fork' | 'leaf' | 'check';
        is_compliant?: boolean;
        required_cert?: string;
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
    ownerRole?: string;
    pendingOwnerRole?: string | null;
    sensorPaired?: boolean;
    sensor_id?: string;
    shippingStatus?: string;
    shippingStatusLabel?: string;
}

export interface Alert {
    id: string;
    batch_id: string;
    type: string;
    message: string;
    created_at: string;
}

export interface BlockchainEvent {
    event: string;
    stage: string;
    details: string;
    actor: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
}

export interface Company {
    id: string;
    name: string;
    type: 'MANUFACTURER' | 'LOGISTICS' | 'RETAILER';
    wallet_address: string;
    production_location?: string;
    is_active: boolean;
    created_at: string;
}

export interface SupplyChainTemplate {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    steps?: TemplateStep[];
}

export interface TemplateStep {
    id: string;
    template_id: string;
    step_order: number;
    name: string;
    icon: string;
    description: string;
    required_cert?: string;
}

export interface Device {
    id: string;
    serial_number: string;
    model: string;
    status: 'ACTIVE' | 'IDLE' | 'FAULTY';
    battery_level: number;
    assigned_company_id?: string;
    assigned_company_name?: string;
    last_ping?: string;
}

import { MANUFACTURER_ADDR } from './constants';

const isServer = typeof window === 'undefined';

// On server (SSR/API Routes), we call backend services directly.
// On client (browser), we call our Next.js API proxies to hide keys.
const PASSPORT_URL = isServer
    ? (process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL || 'http://localhost:8080/api/v1')
    : '/api/passport';

const IOT_URL = isServer
    ? (process.env.NEXT_PUBLIC_IOT_SERVICE_URL || 'http://localhost:8081/api/v1')
    : '/api/telemetry';

const BLOCKCHAIN_URL = isServer
    ? (process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL || 'http://localhost:3000/api/v1')
    : '/api/blockchain';

// Helper for headers
const getHeaders = (isPost = false, token?: string, isJson = true) => {
    const headers: Record<string, string> = {};
    if (isPost && isJson) headers['Content-Type'] = 'application/json';
    
    // Server-side needs the key directly. Client-side proxy will inject it.
    // BUT the proxy itself requires a Bearer token to verify the user role.
    if (isServer) {
        headers['x-api-key'] = process.env.INTERNAL_API_KEY || '';
    } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// --- API CLIENT ---

export async function getBatchDetails(id: string, token?: string): Promise<BatchDetails | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/batches/${id}`, { 
            headers: getHeaders(false, token),
            cache: 'no-store' 
        });
        if (!res.ok) return null;
        const data = await res.json();

        let history: BatchDetails['history'] = [];
        const bcStatus = await getBlockchainStatus(data.id);

        if (data.template_id) {
            try {
                const template = await getTemplateDetails(data.template_id);
                if (template && template.steps) {
                    history = template.steps.map((step: any, index: number) => {
                        const isCompliant = !step.required_cert || 
                                           data.certificates?.some((c: any) => c.type === step.required_cert);
                        
                        // Dynamic status logic based on blockchain ownerRole
                        let status: 'completed' | 'current' | 'future' = 'future';
                        
                        const ownerRole = bcStatus.ownerRole || 'MANUFACTURER';
                        
                        if (ownerRole === 'MANUFACTURER') {
                            status = index === 0 ? 'current' : 'future';
                        } else if (ownerRole === 'LOGISTICS') {
                            if (index === 0) status = 'completed';
                            else if (index === 1) status = 'current';
                            else status = 'future';
                        } else if (ownerRole === 'RETAILER') {
                            if (index <= 1) status = 'completed';
                            else if (index === 2) status = 'current';
                            else status = 'future';
                        }

                        return {
                            stage: step.name,
                            location: index === 0 ? (data.origin_country || "Tracking.origin") : (index === template.steps!.length - 1 ? (data.destination_country || "Tracking.destination") : "Tracking.in_transit"),
                            timestamp: status === 'completed' ? "Tracking.completed" : (status === 'current' ? "Tracking.live" : "Tracking.estimated"), 
                            status,
                            icon: (step.icon || 'package') as any,
                            is_compliant: isCompliant,
                            required_cert: step.required_cert
                        };
                    });
                }
            } catch (err) {
                console.warn("Failed to fetch template steps, falling back to mock");
            }
        }

        if (!history || history.length === 0) {
            const ownerRole = bcStatus.ownerRole || 'MANUFACTURER';

            history = [
                { 
                    stage: "Tracking.stage_produced", 
                    location: data.origin_country || "Tracking.origin_facility", 
                    timestamp: data.created_at, 
                    status: ownerRole === 'MANUFACTURER' ? "current" : "completed", 
                    icon: "package" 
                },
                { 
                    stage: "Tracking.in_transit", 
                    location: "Tracking.global_network", 
                    timestamp: "Tracking.current", 
                    status: ownerRole === 'LOGISTICS' ? "current" : (ownerRole === 'RETAILER' ? "completed" : "future"), 
                    icon: "truck" 
                },
                { 
                    stage: "Tracking.stage_quality", 
                    location: "Tracking.verified", 
                    timestamp: "Tracking.success", 
                    status: ownerRole === 'RETAILER' ? "current" : "future", 
                    icon: "check" 
                }
            ];
        }

        let extendedData: BatchDetails = {
            ...data,
            ingredients: data.ingredients,
            nutrition: data.nutrition,
            halal_cert_url: data.halal_cert_url || "/certificates/standard-cert.pdf",
            manufacturer_name: data.manufacturer_name || "Global FoodTech Verified Factory",
            history,
            partner_id: data.partner_id,
        };

        // Fetch Partner Details if present
        if (data.partner_id) {
            try {
                const partnerRes = await fetch(`${PASSPORT_URL}/partners/${data.partner_id}`, { cache: 'no-store' });
                if (partnerRes.ok) {
                    const partnerData = await partnerRes.json();
                    extendedData.partner_redirect_url = partnerData.verification_redirect_url;
                }
            } catch (err) {
                console.warn("Failed to fetch partner details", err);
            }
        }

        // IPFS Fetch Logic
        if (data.token_uri) {
            try {
                const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";
                const hash = data.token_uri.replace('ipfs://', '');

                const ipfsRes = await fetch(`${ipfsGateway}${hash}`);
                if (ipfsRes.ok) {
                    const ipfsData = await ipfsRes.json();
                    const attributes = ipfsData.attributes || [];
                    const getAttr = (key: string) => attributes.find((a: any) => a.trait_type === key)?.value;

                    // Update Ingredients if present in IPFS
                    if (getAttr("Ingredients")) {
                        extendedData.ingredients = getAttr("Ingredients");
                    }

                    extendedData.production_date = getAttr("Production Date");
                    extendedData.expiration_date = getAttr("Expiration Date");
                    extendedData.production_location = getAttr("Production Location");
                    extendedData.origin_location = getAttr("Origin Location");

                    if (ipfsData.certificates && Array.isArray(ipfsData.certificates)) {
                        extendedData.certificates = ipfsData.certificates.map((cert: any) => ({
                            name: cert.name,
                            type: cert.type || "OTHER",
                            uri: cert.uri.replace('ipfs://', ipfsGateway)
                        }));
                    }
                }
            } catch (ipfsErr) {
                console.warn("Failed to fetch IPFS metadata:", ipfsErr);
            }
        }

        return extendedData;

    } catch (e) {
        console.error('Failed to fetch batch details:', e);
        return null;
    }
}

export async function getTelemetry(id: string, minLimit: number = -22, maxLimit: number = -18, token?: string): Promise<Telemetry[]> {
    try {
        const res = await fetch(`${IOT_URL}/telemetry/${id}`, { 
            headers: getHeaders(false, token),
            cache: 'no-store' 
        });

        if (res.ok) {
            return await res.json();
        }

        return [];
    } catch (e) {
        console.warn('Failed to fetch telemetry:', e);
        return [];
    }
}

export async function getBlockchainStatus(id: string): Promise<BlockchainStatus> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/status/${id}`, { 
            headers: getHeaders(),
            cache: 'no-store' 
        });
        
        if (!res.ok) {
            return {
                status: 'New',
                verified: false,
                owner: MANUFACTURER_ADDR,
                ownerRole: 'MANUFACTURER',
                pendingOwner: null,
                violation: null,
                handover: false
            };
        }

        const data = await res.json();
        return {
            status: data.exists ? 'Notarized' : 'Pending',
            verified: data.exists,
            txHash: data.txHash,
            handover: data.handover,
            violation: data.violation,
            pendingOwner: data.pendingOwner,
            pendingOwnerRole: data.pendingOwnerRole,
            owner: data.owner,
            ownerRole: data.ownerRole
        };
    } catch (e) {
        console.error('Failed to fetch blockchain status:', e);
        return {
            status: 'Offline',
            verified: false,
            owner: MANUFACTURER_ADDR,
            ownerRole: 'MANUFACTURER'
        };
    }
}

export async function uploadToIpfs(formData: FormData, token?: string): Promise<{ ipfsHash: string; success: boolean }> {
    const res = await fetch(`${BLOCKCHAIN_URL}/ipfs/upload`, {
        method: 'POST',
        headers: getHeaders(true, token, false), // false = don't set application/json
        body: formData,
    });

    if (!res.ok) throw new Error(`IPFS Upload Failed: ${res.statusText}`);
    return await res.json();
}

export async function createBatch(batchData: any, token?: string, role?: string): Promise<{ batch_id: string }> {
    const headers = getHeaders(true, token);
    if (role) headers['X-User-Role'] = role;

    const res = await fetch(`${PASSPORT_URL}/batches`, {
        method: 'POST',
        headers,
        body: JSON.stringify(batchData),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create batch');
    }
    return await res.json();
}

export async function getBlockchainHistory(batchId: string): Promise<BlockchainEvent[]> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/history/${batchId}`, {
            headers: getHeaders(),
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch blockchain history:', e);
        return [];
    }
}

export async function getAlerts(id: string, token?: string): Promise<Alert[]> {
    try {
        const res = await fetch(`${IOT_URL}/telemetry/${id}/alerts`, { 
            headers: getHeaders(false, token),
            cache: 'no-store' 
        });
        if (res.ok) {
            return await res.json();
        }
        return [];
    } catch (e) {
        console.warn('Failed to fetch alerts:', e);
        return [];
    }
}

export async function notarizeBatch(batchId: string, dataHash: string = "hash", token?: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/notarize`, {
            method: 'POST',
            headers: getHeaders(true, token),
            body: JSON.stringify({ batchId, dataHash }),
            cache: 'no-store'
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return { status: 'error', error: errData.error || 'Notarization failed' };
        }

        return await res.json();
    } catch (e: any) {
        console.error('Failed to notarize batch:', e);
        return { status: 'error', error: e.message };
    }
}

export async function updateBatchBlockchainHash(batchId: string, blockchainHash: string, token?: string) {
    const response = await fetch(`${PASSPORT_URL}/batches/${batchId}/blockchain`, {
        method: 'PATCH',
        headers: getHeaders(true, token),
        body: JSON.stringify({ blockchain_hash: blockchainHash }),
    });

    if (!response.ok) {
        throw new Error('Failed to update blockchain hash');
    }

    return response.json();
}

export async function initiateHandover(batchId: string, toAddress: string, token?: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/transfer/initiate`, {
            method: 'POST',
            headers: getHeaders(true, token),
            body: JSON.stringify({ batchId, toAddress }),
            cache: 'no-store'
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return { status: 'error', error: errData.error || 'Initiation failed' };
        }
        return await res.json();
    } catch (e: any) {
        console.error('Failed to initiate handover', e);
        return { status: 'error', error: e.message };
    }
}

export async function acceptHandover(batchId: string, token?: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/transfer/accept`, {
            method: 'POST',
            headers: getHeaders(true, token),
            body: JSON.stringify({ batchId }),
            cache: 'no-store'
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return { status: 'error', error: errData.error || 'Acceptance failed' };
        }
        return await res.json();
    } catch (e: any) {
        console.error('Failed to accept handover', e);
        return { status: 'error', error: e.message };
    }
}

export async function resetBatchDemo(batchId: string, token?: string): Promise<{ txHash: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/demo/reset`, {
            method: 'POST',
            headers: getHeaders(true, token),
            body: JSON.stringify({ batchId }),
            cache: 'no-store'
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Reset failed');
        }
        return await res.json();
    } catch (e: any) {
        throw new Error(e.message);
    }
}

export async function reportViolation(batchId: string, details: string, token?: string): Promise<{ status: string; txHash?: string; error?: string }> {
    try {
        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/violation`, {
            method: 'POST',
            headers: getHeaders(true, token),
            body: JSON.stringify({ batchId, details }),
            cache: 'no-store'
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return { status: 'error', error: errData.error || 'Violation report failed' };
        }
        return await res.json();
    } catch (e: any) {
        console.error('Failed to report violation', e);
        return { status: 'error', error: e.message };
    }
}

// --- ADMIN API ---

export async function getCompanies(token?: string): Promise<Company[]> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/companies`, { 
            headers: getHeaders(false, token),
            cache: 'no-store' 
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Admin API Error:', e);
        return [];
    }
}

export async function createCompany(company: Partial<Company>, token?: string): Promise<Company | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/companies`, {
            method: 'POST',
            headers: getHeaders(true, token),
            body: JSON.stringify(company),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Create Company Error:', e);
        return null;
    }
}

export async function approveCompany(id: string, token?: string): Promise<boolean> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/companies/${id}/approve`, {
            method: 'PATCH',
            headers: getHeaders(true, token),
        });
        return res.ok;
    } catch (e) {
        console.error('Approve Company Error:', e);
        return false;
    }
}

export async function getTemplates(token?: string): Promise<SupplyChainTemplate[]> {
    try {
        const res = await fetch(`${PASSPORT_URL}/templates`, { 
            headers: getHeaders(false, token),
            cache: 'no-store' 
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch templates:', e);
        return [];
    }
}

export async function getTemplateDetails(id: string, token?: string): Promise<SupplyChainTemplate | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/templates/${id}`, { 
            headers: getHeaders(false, token),
            cache: 'no-store' 
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch template details:', e);
        return null;
    }
}

export async function createAdminTemplate(data: Partial<SupplyChainTemplate>, token?: string): Promise<SupplyChainTemplate | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/templates`, {
            method: 'POST',
            headers: getHeaders(true, token),
            body: JSON.stringify(data),
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Admin API Error:', e);
        return null;
    }
}

export async function updateAdminTemplate(id: string, data: Partial<SupplyChainTemplate>, token?: string): Promise<SupplyChainTemplate | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/templates/${id}`, {
            method: 'PUT',
            headers: getHeaders(true, token),
            body: JSON.stringify(data),
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Admin API Error:', e);
        return null;
    }
}

export async function deleteAdminTemplate(id: string, token?: string): Promise<boolean> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/templates/${id}`, {
            method: 'DELETE',
            headers: getHeaders(false, token),
            cache: 'no-store'
        });
        return res.ok;
    } catch (e) {
        console.error('Admin API Error:', e);
        return false;
    }
}

export async function getDevices(token?: string): Promise<Device[]> {
    try {
        const res = await fetch(`${IOT_URL}/devices`, { 
            headers: getHeaders(false, token),
            cache: 'no-store' 
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch devices:', e);
        return [];
    }
}

export async function getAdminBatches(token?: string): Promise<BatchDetails[]> {
    try {
        const headers = getHeaders(false, token);
        headers['X-User-Role'] = 'ADMIN';

        const res = await fetch(`${PASSPORT_URL}/admin/batches`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const rawBatches: BatchDetails[] = await res.json();
        
        // Decorate top 10 batches with full details/history for the Stage Wizard
        const decoratedBatches = await Promise.all(
            rawBatches.slice(0, 10).map(b => getBatchDetails(b.id, token))
        );

        return decoratedBatches.filter((b): b is BatchDetails => b !== null);
    } catch (e) {
        console.error('Admin API Error (getAdminBatches):', e);
        return [];
    }
}

export async function getBlockchainAdminStatus(token?: string): Promise<any> {
    try {
        const headers = getHeaders(false, token);
        headers['X-User-Role'] = 'ADMIN';

        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/admin/status`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Admin API Error (getBlockchainAdminStatus):', e);
        return null;
    }
}

export async function advanceBatchDemo(batchId: string, targetRole: 'LOGISTICS' | 'RETAILER', token?: string): Promise<any> {
    try {
        const headers = getHeaders(true, token);
        headers['X-User-Role'] = 'ADMIN';

        const res = await fetch(`${BLOCKCHAIN_URL}/blockchain/demo/advance`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ batchId, targetRole }),
            cache: 'no-store'
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Demo advance failed');
        }
        return await res.json();
    } catch (e: any) {
        console.error('Demo API Error (advanceBatchDemo):', e);
        throw e;
    }
}

