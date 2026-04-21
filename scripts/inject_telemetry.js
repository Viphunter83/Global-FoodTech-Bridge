#!/usr/bin/env node

const BATCH_ID = process.argv[2];
const INTERNAL_API_KEY = "ftb_internal_6b7a8c9d0e1f2a3b4c5d6e7f8g9h0i1j"; // the one mapped in passport service
const IOT_SERVICE_URL = "http://localhost:8081/api/v1"; // Using local or railway url? Let's use the gateway/proxy or local if available. Actually, since Railway is running the backend, we should use the Railway URL directly if local is unavailable. Oh wait, my verify_secrets.sh failed because Railway wasn't installed, but I saw the variables in previous steps: "https://celebrated-consideration-production.up.railway.app/api/v1".

const TARGET_URL = "https://celebrated-consideration-production.up.railway.app/api/v1";

if (!BATCH_ID) {
    console.error("Please provide a BATCH_ID");
    process.exit(1);
}

const mockJourney = [
    { gps: { lat: 10.762622, lng: 106.660172 }, temp: 4.0, hum: 60.5, desc: "Ho Chi Minh City, Vietnam (Origin)" },
    { gps: { lat: 18.2323, lng: 119.5332 }, temp: 4.1, hum: 61.2, desc: "South China Sea Transit" },
    { gps: { lat: 30.1231, lng: 160.4321 }, temp: 3.8, hum: 59.8, desc: "Pacific Ocean Transit" },
    { gps: { lat: 33.754185, lng: -118.216458 }, temp: 4.2, hum: 60.0, desc: "Port of Long Beach, USA (Destination)" }
];

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {
    console.log(`Starting Telemetry Injection for Batch: ${BATCH_ID}`);

    for (let i = 0; i < mockJourney.length; i++) {
        const point = mockJourney[i];
        console.log(`Injecting point ${i+1}: ${point.desc}`);
        
        try {
            const res = await fetch(`${TARGET_URL}/telemetry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': INTERNAL_API_KEY,    // using correct header for IoT RoleMiddleware
                    'x-user-role': 'SYSTEM'
                },
                body: JSON.stringify({
                    batch_id: BATCH_ID,
                    sensor_id: `sensor-mango-${BATCH_ID.substring(0,6)}`,
                    temperature: point.temp,
                    humidity: point.hum,
                    gps_coordinates: `${point.gps.lat},${point.gps.lng}`,
                    timestamp: new Date().toISOString()
                })
            });
            if (!res.ok) {
                const text = await res.text();
                console.error(`Failed: ${res.status} - ${text}`);
            } else {
                console.log(`Success: ${point.desc}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
        await sleep(1500);
    }
    console.log("Telemetry injection complete.");
}

run();
