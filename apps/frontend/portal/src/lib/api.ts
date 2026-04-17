export interface BatchCertificate {
    hash: string;
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
    // IPFS Extended Data
    production_date?: string;
    expiration_date?: string;
    production_location?: string;
    origin_location?: string;
    certificates?: BatchCertificate[];
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
    sensorPaired?: boolean;
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

import { MANUFACTURER_ADDR } from './constants';

const isServer = typeof window === 'undefined';

const PASSPORT_URL = isServer
    ? (process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL || 'http://passport-service:8080/api/v1')
    : '/api/passport';

const IOT_URL = isServer
    ? (process.env.NEXT_PUBLIC_IOT_SERVICE_URL || 'http://iot-service:8081/api/v1')
    : '/api/telemetry';

const BLOCKCHAIN_URL = isServer
    ? (process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL || 'http://blockchain-service:3000/api/v1')
    : '/api/blockchain';

// --- API CLIENT ---

export async function getBatchDetails(id: string): Promise<BatchDetails | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/batches/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();

        // Base Mock Data with dynamic logic
        const isBeef = data.product_type?.toLowerCase().includes('beef') || data.product_type?.toLowerCase().includes('meat');
        const isMango = data.product_type?.toLowerCase().includes('mango');

        // Dynamic History/Timeline Logic
        let history: BatchDetails['history'] = [];
        if (data.template_id) {
            try {
                const template = await getTemplateDetails(data.template_id);
                if (template && template.steps) {
                    history = template.steps.map((step, index) => {
                        const isCompliant = !step.required_cert || 
                                           data.certificates?.some((c: any) => c.type === step.required_cert);
                        
                        return {
                            stage: step.name,
                            location: index === 0 ? (data.origin_country || "Origin") : (index === template.steps!.length - 1 ? (data.destination_country || "Destination") : "In Transit"),
                            timestamp: index === 0 ? "Started" : (index < 3 ? "Completed" : "Estimated"), 
                            status: index < 3 ? "completed" : (index === 3 ? "current" : "future") as any,
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

        if (history.length === 0) {
            history = [
                { stage: "Produced & Packed", location: data.origin_country || "Origin Facility", timestamp: "Fri, Oct 10 • 08:30", status: "completed", icon: "package" },
                { stage: "Quality Check (AI)", location: "Line 1", timestamp: "Fri, Oct 10 • 09:15", status: "completed", icon: "warehouse" },
                { stage: "Cold Chain Logistics", location: "Universal Transit", timestamp: "Sat, Oct 11 • 14:00", status: "completed", icon: "truck" },
                { stage: "Arrived at Hub", location: data.destination_country || "International Hub", timestamp: "Today • 07:45", status: "current", icon: "warehouse" },
                { stage: "Ready for Retail", location: "Global Network", timestamp: "Est. Tomorrow", status: "future", icon: "fork" }
            ];
        }

        let extendedData: BatchDetails = {
            ...data,
            ingredients: data.ingredients || (isBeef ? {
                en: "Premium Beef (80%), Rice Noodles, Spices, Sea Salt.",
                ar: "لحм بقري ممتاز (80٪) ، نودلز أرز ، بهارات ، ملح البحر.",
                ru: "Говядина премиум (80%), Рисовая лапша, Специи, Морская соль.",
                vi: "Thịt bò cao cấp (80%), Bún gạo, Gia vị, Muối biển."
            } : isMango ? {
                en: "Organic Dried Mango (100%), No added sugar.",
                ar: "مانجو مجфف عضوي (100٪) ، بدون سكر مضاف.",
                ru: "Органическое сушеное манго (100%), без добавления сахара.",
                vi: "Xoài sấy hữu cơ (100%), Không thêm đường."
            } : {
                en: "Natural Organic Product",
                ar: "منتج عضوي طبيعي",
                ru: "Натуральный органический продукт",
                vi: "Sản phẩm hữu cơ tự nhiên"
            }),
            nutrition: data.nutrition || (isMango ? { calories: 150, protein: 1, fat: 0, carbs: 38 } : { calories: 450, protein: 35, fat: 12, carbs: 55 }),
            halal_cert_url: data.halal_cert_url || "/certificates/standard-cert.pdf",
            manufacturer_name: data.manufacturer_name || "Global FoodTech Verified Factory",
            history
        };

        // IPFS Fetch Logic
        if (data.token_uri) {
            try {
                // Use a public gateway. Ideally, use env var for gateway.
                const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";
                // token_uri might be just the hash or ipfs://hash
                const hash = data.token_uri.replace('ipfs://', '');

                const ipfsRes = await fetch(`${ipfsGateway}${hash}`);
                if (ipfsRes.ok) {
                    const ipfsData = await ipfsRes.json();

                    // Merge IPFS data
                    // Attributes format: [{ trait_type: "Ingredients", value: "..." }, ...]
                    const attributes = ipfsData.attributes || [];
                    const getAttr = (key: string) => attributes.find((a: any) => a.trait_type === key)?.value;

                    // Update Ingredients if present
                    const ipfsIngredients = getAttr("Ingredients");
                    if (ipfsIngredients) {
                        // Assuming IPFS text is English/Generic for now, unless structured
                        extendedData.ingredients = {
                            en: ipfsIngredients,
                            ar: "المكونات من المستند الرقمي", // Placeholder for translation
                            ru: ipfsIngredients, // Fallback
                            vi: ipfsIngredients // Fallback
                        };
                    }

                    // Update Dates
                    extendedData.production_date = getAttr("Production Date");
                    extendedData.expiration_date = getAttr("Expiration Date");

                    // Update Locations
                    extendedData.production_location = getAttr("Production Location");
                    extendedData.origin_location = getAttr("Origin Location");

                    // Update Certificates
                    if (ipfsData.certificates && Array.isArray(ipfsData.certificates)) {
                        extendedData.certificates = ipfsData.certificates.map((cert: any) => ({
                            name: cert.name,
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

export async function getTelemetry(id: string, minLimit: number = -22, maxLimit: number = -18): Promise<Telemetry[]> {
    try {
        const res = await fetch(`${IOT_URL}/telemetry/${id}`, { cache: 'no-store' });

        let data = [];
        if (res.ok) {
            data = await res.json();
        }

        // MOCK: Generate realistic curve based on actual SLA limits
        if (!data || data.length === 0) {
            const now = Date.now();
            const mockData: Telemetry[] = [];
            // Target roughly the middle of the safe zone
            const targetAvg = (minLimit + maxLimit) / 2;
            const variance = Math.abs(maxLimit - minLimit) * 0.2;

            for (let i = 0; i < 96; i++) {
                const time = now - (i * 15 * 60 * 1000);
                // "Sawtooth" pattern around the safe zone
                const cycle = Math.sin(i / 2);
                let temp = targetAvg + (cycle * variance);

                mockData.push({
                    timestamp: new Date(time).toISOString(),
                    temperature_celsius: parseFloat(temp.toFixed(1)),
                    device_id: "dev_01",
                    location_lat: 10.7 + (Math.random() * 0.01), // Near equator by default if no loc
                    location_lon: 106.6 + (Math.random() * 0.01)
                });
            }
            return mockData.reverse();
        }

        return data;
    } catch (e) {
        console.warn('Failed to fetch telemetry, using mock:', e);
        return [];
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

/**
 * Updates the blockchain transaction hash for a batch in the main database.
 */
export async function updateBatchBlockchainHash(batchId: string, blockchainHash: string) {
    const response = await fetch(`${PASSPORT_URL}/batches/${batchId}/blockchain`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockchain_hash: blockchainHash }),
    });

    if (!response.ok) {
        throw new Error('Failed to update blockchain hash');
    }

    return response.json();
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

// --- ADMIN API ---

export async function createCompany(data: { name: string; type: string; production_location: string }): Promise<Company | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error('Failed to create company');
            return null;
        }

        return await res.json();
    } catch (e) {
        console.error('Admin API Error:', e);
        return null;
    }
}

export async function getCompanies(): Promise<Company[]> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/companies`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data || [];
    } catch (e) {
        console.error('Admin API Error:', e);
        return [];
    }
}

export async function approveCompany(id: string): Promise<boolean> {
    try {
        const res = await fetch(`${PASSPORT_URL}/admin/companies/${id}/approve`, {
            method: 'POST',
            referrerPolicy: 'no-referrer', // Avoid some CORS issues locally
            cache: 'no-store'
        });
        return res.ok;
    } catch (e) {
        console.error('Failed to approve company', e);
        return false;
    }
}

export async function getTemplates(): Promise<SupplyChainTemplate[]> {
    try {
        const res = await fetch(`${PASSPORT_URL}/templates`, { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch templates:', e);
        return [];
    }
}

export async function getTemplateDetails(id: string): Promise<SupplyChainTemplate | null> {
    try {
        const res = await fetch(`${PASSPORT_URL}/templates/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch template details:', e);
        return null;
    }
}
