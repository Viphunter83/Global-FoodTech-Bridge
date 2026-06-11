const assert = require('assert');

// URLs from production config
const API_KEY = "ftb_internal_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d";
const PASSPORT_URL = "https://chic-playfulness-production-d0d6.up.railway.app/api/v1";
const TELEMETRY_URL = "https://celebrated-consideration-production.up.railway.app/api/v1";
const BLOCKCHAIN_URL = "https://global-foodtech-bridge-production.up.railway.app/api/v1";

const REDIRECT_URL = "https://global-food-tech-bridge.vercel.app/demo-shop/vietnam-mango";

async function runE2ETest() {
    console.log("🟢 Starting E2E Business Scenario Test: Vietnam Mango to USA...");
    console.log(`- Passport Service: ${PASSPORT_URL}`);
    console.log(`- IoT Telemetry: ${TELEMETRY_URL}`);
    console.log(`- Blockchain Service: ${BLOCKCHAIN_URL}\n`);

    let batchId = null;

    try {
        // --- 1. CREATE BATCH ---
        console.log("📦 Step 1: Creating Batch in Passport Service...");
        const createRes = await fetch(`${PASSPORT_URL}/batches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'X-Verified-Role': 'MANUFACTURER'
            },
            body: JSON.stringify({
                manufacturer_id: "550e8400-e29b-41d4-a716-446655440000",
                product_type: "DRIED_MANGO_PREMIUM",
                batch_size: 2500,
                template_id: "1bccdd0c-3cdf-41fb-b51a-0fed8133a818",
                origin_country: "Vietnam (Bến Tre Province)",
                destination_country: "USA (Port of Long Beach)",
                partner_redirect_url: REDIRECT_URL,
                ingredients: {
                    en: "Hand-picked Organic Cat Chu Mango (99%), Trace amount of natural lemon juice (1%)",
                    ru: "Органический манго Кат Чу ручного сбора (99%), натуральный лимонный сок (1%)"
                },
                nutrition: {
                    calories: 310,
                    protein: 2.1,
                    fat: 0.4,
                    carbs: 76
                },
                marketing_story: {
                    en: "Sourced from sustainable orchards in Bến Tre. Premium low-temperature dehydration preserves nutrients.",
                    ru: "Собрано в экологичных садах провинции Бенче. Низкотемпературная дегидратация."
                },
                certificates: [
                    { type: "USDA_ORGANIC", name: "USDA Organic Certificate", uri: "https://ipfs.io/ipfs/bafybeihdwdv4s54" },
                    { type: "FDA_REGISTERED", name: "FDA Facility Registration", uri: "https://ipfs.io/ipfs/bafybeihdwdv4s54" },
                    { type: "HACCP_GOLD", name: "HACCP Food Safety Gold", uri: "https://ipfs.io/ipfs/bafybeihdwdv4s54" }
                ]
            })
        });

        if (!createRes.ok) {
            throw new Error(`Failed to create batch: ${createRes.status} ${await createRes.text()}`);
        }

        const createData = await createRes.json();
        batchId = createData.batch_id || createData.id;
        assert.ok(batchId, "Batch ID must be generated");
        console.log(`✅ Step 1 Success! Created Batch ID: ${batchId}`);

        // --- 2. NOTARIZE BATCH ---
        console.log("\n🔗 Step 2: Notarizing Batch on Blockchain...");
        const notarizeRes = await fetch(`${BLOCKCHAIN_URL}/blockchain/notarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                batchId: batchId,
                dataHash: `ipfs://premium-mango-metadata-${batchId}`
            })
        });

        if (!notarizeRes.ok) {
            throw new Error(`Failed to notarize batch: ${notarizeRes.status} ${await notarizeRes.text()}`);
        }

        const notarizeData = await notarizeRes.json();
        console.log(`✅ Step 2 Success! Notarization TX Hash: ${notarizeData.txHash || 'MOCK_OK'}`);

        // --- 3. VERIFY NOTARIZATION STATUS ---
        console.log("\n🔍 Step 3: Verifying Blockchain Status via Public Endpoint...");
        const statusRes = await fetch(`${BLOCKCHAIN_URL}/blockchain/status/${batchId}`, {
            headers: { 'x-api-key': API_KEY }
        });

        if (!statusRes.ok) {
            throw new Error(`Failed to get blockchain status: ${statusRes.status} ${await statusRes.text()}`);
        }

        const statusData = await statusRes.json();
        assert.strictEqual(statusData.exists, true, "Batch must exist on blockchain");
        assert.strictEqual(statusData.ownerRole, 'MANUFACTURER', "Initial blockchain owner role must be MANUFACTURER");
        console.log(`✅ Step 3 Success! Blockchain verified. Owner Role: ${statusData.ownerRole}`);

        // --- 4. SIMULATE HANDOVER TO LOGISTICS ---
        console.log("\n🚛 Step 4: Simulating Handover to Logistics...");
        const transferRes = await fetch(`${BLOCKCHAIN_URL}/blockchain/demo/advance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                batchId: batchId,
                targetRole: 'LOGISTICS'
            })
        });

        if (!transferRes.ok) {
            throw new Error(`Failed to advance batch: ${transferRes.status} ${await transferRes.text()}`);
        }

        const transferData = await transferRes.json();
        console.log(`✅ Step 4 Success! Handover advanced. Transfer TX: ${transferData.txHash}`);

        // Re-verify status is LOGISTICS
        const statusLogisticsRes = await fetch(`${BLOCKCHAIN_URL}/blockchain/status/${batchId}`, {
            headers: { 'x-api-key': API_KEY }
        });
        const statusLogisticsData = await statusLogisticsRes.json();
        assert.strictEqual(statusLogisticsData.ownerRole, 'LOGISTICS', "Blockchain owner role must now be LOGISTICS");
        console.log(`   -> Confirmed blockchain owner role is LOGISTICS`);

        // --- 5. INGEST OPTIMAL TELEMETRY ---
        console.log("\n🌡️ Step 5: Sending Optimal Temperature Telemetry (4.5°C)...");
        const normalTemps = [4.4, 4.5, 4.6];
        for (let i = 0; i < normalTemps.length; i++) {
            const telemetryRes = await fetch(`${TELEMETRY_URL}/telemetry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                },
                body: JSON.stringify({
                    batch_id: batchId,
                    device_id: "TIVE-EXP-USA-99",
                    temp: normalTemps[i],
                    lat: 10.76 + (i * 0.1),
                    lon: 106.66 + (i * 0.1)
                })
            });
            if (!telemetryRes.ok) {
                throw new Error(`Failed to send normal telemetry point ${i}: ${telemetryRes.status}`);
            }
            console.log(`   -> Ingested normal point: ${normalTemps[i]}°C`);
        }
        console.log(`✅ Step 5 Success! Optimal telemetry recorded.`);

        // --- 6. TRIGGER TEMPERATURE SLA VIOLATION ---
        console.log("\n🚨 Step 6: Ingesting Critically High Temperature (28.0°C) to Trigger SLA Violation...");
        const violationRes = await fetch(`${TELEMETRY_URL}/telemetry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                batch_id: batchId,
                device_id: "TIVE-EXP-USA-99",
                temp: 28.0,
                lat: 15.0,
                lon: 115.0
            })
        });

        if (!violationRes.ok) {
            throw new Error(`Failed to send violation telemetry: ${violationRes.status}`);
        }

        console.log("   -> Telemetry sent. Waiting for async violation processing in blockchain...");
        
        // Polling status for 5 seconds to ensure the Redis outbox/blockchain relayer processed it
        let violationDetected = false;
        for (let attempt = 1; attempt <= 5; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const checkStatusRes = await fetch(`${BLOCKCHAIN_URL}/blockchain/status/${batchId}`, {
                headers: { 'x-api-key': API_KEY }
            });
            const checkStatus = await checkStatusRes.json();
            if (checkStatus.violation) {
                violationDetected = true;
                console.log(`✅ Step 6 Success! Violation found on Blockchain: "${checkStatus.violation}"`);
                break;
            }
            console.log(`   -> Polling attempt ${attempt}/5: Violation not recorded yet...`);
        }

        assert.ok(violationDetected, "Blockchain must record the violation");

        // --- 7. VERIFY COMPREHENSIVE PUBLIC SCAN DATA ---
        console.log("\n🛒 Step 7: Simulating Public Consumer QR Scan & Verification...");
        const scanRes = await fetch(`${PASSPORT_URL}/batches/${batchId}`);
        if (!scanRes.ok) {
            throw new Error(`Failed to fetch scan passport: ${scanRes.status}`);
        }

        const scanData = await scanRes.json();
        
        // Assert business variables
        assert.strictEqual(scanData.product_type, "DRIED_MANGO_PREMIUM", "Product type mismatch");
        assert.strictEqual(scanData.partner_redirect_url, REDIRECT_URL, "Funnel Redirect URL mismatch");
        assert.strictEqual(scanData.origin_country, "Vietnam (Bến Tre Province)", "Origin mismatch");
        
        // Assert certificates
        assert.ok(scanData.certificates && scanData.certificates.length >= 3, "Missing certificates in public passport");
        console.log(`   -> Public passport verified. Certificates found: ${scanData.certificates.map(c => c.type).join(', ')}`);
        console.log(`   -> Public Redirect Funnel Verified: ${scanData.partner_redirect_url}`);

        // Verify history has events
        assert.ok(scanData.history && scanData.history.length > 0, "Passport history must contain blockchain events");
        console.log(`   -> Blockchain History log verified. Found ${scanData.history.length} lifecycle events.`);

        console.log("\n🎉 E2E TEST PASSED SUCCESSFULLY!");
        console.log(`🏆 Verified all steps for Vietnam Mango -> USA funnel scenario.`);
        console.log(`🔗 Scan verification URL: https://global-food-tech-bridge.vercel.app/en/scan/${batchId}`);

    } catch (error) {
        console.error("\n❌ E2E TEST FAILED:", error.message);
        process.exit(1);
    }
}

runE2ETest();
