import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';
import Redis from 'ioredis';
import { Mutex } from 'async-mutex';

const REGISTRY_ABI = [
    "function createBatch(string memory batchUUID, string memory tokenURI) public",
    "function initiateTransfer(uint256 tokenId, address to) public",
    "function acceptTransfer(uint256 tokenId) public",
    "function reportViolation(string memory batchUUID, string memory details) public",
    "function getBatchData(string memory batchUUID) public view returns (address currentOwner, string memory uri, string memory violation, bool isViolated, uint256 timestamp, address pendingOwner)",
    "function grantRole(bytes32 role, address account) public",
    "event BatchCreated(uint256 indexed tokenId, string batchUUID, address indexed producer, uint256 timestamp)",
    "event TransferInitiated(uint256 indexed tokenId, address indexed from, address indexed to)",
    "event TransferCompleted(uint256 indexed tokenId, address indexed from, address indexed to)",
    "event ViolationReported(uint256 indexed tokenId, string details, address indexed reporter, uint256 timestamp)"
];

// Providers commonly cap eth_getLogs at 10k blocks; the x402 gateway allows a larger range.
const HISTORY_CHUNK_SIZE = 9_999;
const HISTORY_CHUNK_SIZE_X402 = 100_000;
const HISTORY_MAX_CHUNKS_PER_REQUEST = 50;
const HISTORY_CACHE_TTL_SECONDS = 7 * 24 * 3600;

interface HistoryLog {
    type: string;
    args: string[];
    blockNumber: number;
    transactionHash: string;
    timestamp: number;
}

/** Accepts a service URL with or without the `/api/v1` suffix and returns its base. */
function serviceBase(url: string): string {
    return url.trim().replace(/\/$/, '').replace(/\/api\/v1$/, '');
}

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: JsonRpcProvider;

    // Wallets for each role (Custodial)
    private manufacturerWallet: Wallet; // Default Admin
    private logisticsWallet: Wallet;
    private retailerWallet: Wallet;
    private redis: Redis;

    private contract: Contract;
    private isMockMode: boolean = false;
    private usesX402 = false;
    private readonly walletMutexes = new Map<string, Mutex>();

    // Mock Store
    private mockStore = new Map<string, { owner: string; pendingOwner: string | null; uri: string; violation: string | null; timestamp: number }>();

    constructor(private configService: ConfigService) { }

    private getMutexForAddress(address: string): Mutex {
        const lower = address.toLowerCase();
        if (!this.walletMutexes.has(lower)) {
            this.walletMutexes.set(lower, new Mutex());
        }
        return this.walletMutexes.get(lower)!;
    }

    /**
     * Helper to execute transaction with manual nonce management (queued via Mutex)
     */
    private async executeTransaction(signer: Wallet, contractCall: () => Promise<any>): Promise<any> {
        const mutex = this.getMutexForAddress(signer.address);
        
        return await mutex.runExclusive(async () => {
            this.logger.log(`[NONCE-MANAGER] Executing transaction for ${signer.address}`);
            try {
                // ethers v6 automatically fetches the latest nonce including pending when using a wallet connected to a provider
                // but concurrent calls still risk collisions. The mutex ensures we wait for the previous one to be broadcast.
                const tx = await contractCall();
                this.logger.log(`[NONCE-MANAGER] TX Sent: ${tx.hash}. Waiting for confirmation...`);
                const receipt = await tx.wait();
                this.logger.log(`[NONCE-MANAGER] TX Confirmed in block ${receipt.blockNumber}`);
                return tx;
            } catch (error) {
                this.logger.error(`[NONCE-MANAGER] Transaction failed: ${error.message}`);
                throw error;
            }
        });
    }

    async onModuleInit() {
        const rpcUrl = this.configService.get<string>('RPC_URL')?.trim();
        const privateKey = this.configService.get<string>('PRIVATE_KEY'); // Should be Manufacturer
        const logisticsKey = this.configService.get<string>('LOGISTICS_KEY');
        const retailerKey = this.configService.get<string>('RETAILER_KEY');
        const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
        let useX402 = this.configService.get<string>('USE_X402') === 'true';

        // If we use DRPC, we must bypass QuickNode x402 proxy wrapper
        if (rpcUrl && rpcUrl.includes('drpc.live')) {
            useX402 = false;
        }

        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        this.redis = new Redis(redisUrl);

        // MOCK mode returns fake tx hashes; it must never silently replace the real chain in production
        const allowMock = process.env.NODE_ENV !== 'production' || process.env.ALLOW_MOCK_MODE === 'true';

        if (!rpcUrl || !privateKey || !contractAddress) {
            if (!allowMock) {
                throw new Error('RPC_URL, PRIVATE_KEY and CONTRACT_ADDRESS are required in production');
            }
            this.logger.warn('Blockchain config missing. Starting in MOCK mode.');
            this.isMockMode = true;
            return;
        }

        try {
            this.usesX402 = useX402;
            if (useX402) {
                this.logger.log('Initializing blockchain connection with QuickNode x402...');
                const { createQuicknodeX402Client } = await import('@quicknode/x402');
                
                const paymentNetwork = rpcUrl.includes('amoy') ? 'eip155:80002' : 'eip155:137';
                const targetNetworkName = rpcUrl.includes('amoy') ? 'polygon-amoy' : 'polygon-mainnet';
                const targetUrl = `https://x402.quicknode.com/${targetNetworkName}`;
                
                this.logger.log(`x402 Client setup: paying on ${paymentNetwork}, querying target: ${targetUrl}`);
                
                const formattedKey = (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as `0x${string}`;
                
                const x402Client = await createQuicknodeX402Client({
                    baseUrl: 'https://x402.quicknode.com',
                    network: paymentNetwork,
                    evmPrivateKey: formattedKey,
                    preAuth: true,
                });
                
                const fetchReq = new ethers.FetchRequest(targetUrl);
                fetchReq.getUrlFunc = async (req: ethers.FetchRequest, signal?: any) => {
                    const bodyStr = req.body ? ethers.toUtf8String(req.body) : undefined;
                    const res = await x402Client.fetch(req.url, {
                        method: req.method,
                        headers: req.headers,
                        body: bodyStr,
                    });
                    
                    const headers: Record<string, string> = {};
                    res.headers.forEach((value, key) => {
                        headers[key] = value;
                    });
                    
                    const bodyText = await res.text();
                    const bodyBytes = ethers.toUtf8Bytes(bodyText);
                    
                    return {
                        statusCode: res.status,
                        statusMessage: res.statusText,
                        headers,
                        body: bodyBytes
                    };
                };
                
                this.provider = new ethers.JsonRpcProvider(fetchReq);
            } else {
                this.provider = new ethers.JsonRpcProvider(rpcUrl);
            }

            // Initialize All Custodial Wallets
            this.manufacturerWallet = new ethers.Wallet(privateKey, this.provider);
            this.logisticsWallet = logisticsKey ? new ethers.Wallet(logisticsKey, this.provider) : this.manufacturerWallet;
            this.retailerWallet = retailerKey ? new ethers.Wallet(retailerKey, this.provider) : this.manufacturerWallet;

            // Default contract connected to Manufacturer (Admin)
            this.contract = new ethers.Contract(contractAddress, REGISTRY_ABI, this.manufacturerWallet);

            // Fail loudly instead of silently talking to the wrong network
            const expectedChainId = this.configService.get<string>('CHAIN_ID');
            const { chainId } = await this.provider.getNetwork();
            if (expectedChainId && chainId.toString() !== expectedChainId) {
                throw new Error(`RPC_URL points to chain ${chainId}, but CHAIN_ID=${expectedChainId}`);
            }

            this.logger.log(`Blockchain Service Initialized on ${useX402 ? 'QuickNode x402' : (rpcUrl.includes('amoy') ? 'Polygon Amoy' : 'Polygon Mainnet')}`);
            this.logger.log(`- Manufacturer: ${this.manufacturerWallet.address}`);
            this.logger.log(`- Logistics: ${this.logisticsWallet.address}`);
            this.logger.log(`- Retailer: ${this.retailerWallet.address}`);

        } catch (error) {
            this.logger.error('Failed to initialize blockchain connection', error);
            if (!allowMock) throw error;
            this.isMockMode = true;
        }
    }

    async createBatch(batchId: string, ipfsUri: string): Promise<string> {
        this.logger.log(`Creating Batch NFT ${batchId}`);
        if (this.isMockMode) {
            // Mock logic...
            this.mockStore.set(batchId, {
                owner: '0xProducerAddress',
                pendingOwner: null,
                uri: ipfsUri,
                violation: null,
                timestamp: Date.now()
            });
            return `0xMOCK_MINT_${Date.now()}`;
        }

        try {
            // Manufacturer creates batch
            const tx = await this.executeTransaction(this.manufacturerWallet, () => 
                (this.contract.connect(this.manufacturerWallet) as any).createBatch(batchId, ipfsUri)
            );
            
            // Set initial logical role for single-wallet notary model
            await this.redis.set(`batch_role:${batchId}`, 'MANUFACTURER');
            return tx.hash;
        } catch (error) {
            this.logger.error('Blockchain minting failed', error);
            throw new Error(`Blockchain minting failed: ${error.message}`);
        }
    }

    async registerViolation(batchId: string, details: string): Promise<string> {
        if (this.isMockMode) {
            this.logger.warn(`[MOCK] Reporting Violation for ${batchId}: ${details}`);
            const state = this.mockStore.get(batchId);
            if (state) {
                state.violation = details;
                this.mockStore.set(batchId, state);
            }
            return `0xMOCK_VIOLATION_TX_${Date.now()}`;
        }

        try {
            const tx = await this.executeTransaction(this.manufacturerWallet, () => 
                this.contract.reportViolation(batchId, details)
            );

            // Sync with Passport Service (Business Logic state)
            const passportUrl = this.configService.get<string>('PASSPORT_SERVICE_URL');
            const apiKey = this.configService.get<string>('INTERNAL_API_KEY');
            if (passportUrl && apiKey) {
                try {
                    await fetch(`${serviceBase(passportUrl)}/api/v1/batches/${batchId}/violation`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'x-api-key': apiKey 
                        },
                        body: JSON.stringify({ details })
                    });
                    this.logger.log(`[SYNC] Violation synced to Passport for ${batchId}`);
                } catch (syncErr) {
                    this.logger.warn(`[SYNC] Failed to sync violation to Passport: ${syncErr.message}`);
                }
            }

            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to report violation', error);
            throw new Error(`Blockchain violation report failed: ${error.message}`);
        }
    }

    /**
     * Outbox Pattern: Pushes violation to Redis Stream for async processing
     */
    async reportViolationAsync(batchId: string, details: string): Promise<{ status: string; eventId: string }> {
        const streamKey = 'batch:violations';
        const payload = JSON.stringify({
            batch_id: batchId,
            message: details,
            timestamp: new Date().toISOString(),
            type: 'MANUAL_VIOLATION'
        });

        const eventId = await this.redis.xadd(streamKey, '*', 'payload', payload);
        this.logger.log(`[OUTBOX] Violation queued for batch ${batchId}. EventID: ${eventId}`);
        
        return { status: 'queued', eventId };
    }

    /**
     * Step 1: Initiate Transfer
     */
    async initiateTransfer(batchId: string, toAddress: string): Promise<string> {
        if (this.isMockMode) {
            this.logger.log(`[MOCK] Initiating transfer of ${batchId} to ${toAddress}`);
            const state = this.mockStore.get(batchId);
            if (state) {
                state.pendingOwner = toAddress;
                this.mockStore.set(batchId, state);
            } else {
                this.logger.warn(`[MOCK] Cannot initiate transfer: batch ${batchId} not found in mock store`);
                throw new Error(`Batch ${batchId} not found in mock store`);
            }
            return `0xMOCK_INIT_TRANSFER_${Date.now()}`;
        }

        try {
            const tokenId = ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]));
            const result = await this.contract.getBatchData(batchId);
            const currentOwner = result[0];

            let signer = this.manufacturerWallet;
            if (currentOwner.toLowerCase() === this.logisticsWallet.address.toLowerCase()) signer = this.logisticsWallet;
            if (currentOwner.toLowerCase() === this.retailerWallet.address.toLowerCase()) signer = this.retailerWallet;

            this.logger.log(`Initiating transfer of ${batchId} to ${toAddress}. Signer: ${signer.address}`);

            const tx = await this.executeTransaction(signer, () => 
                (this.contract.connect(signer) as any).initiateTransfer(tokenId, toAddress)
            );

            // Single-wallet logic: advance logical role to pending
            const currentRole = await this.redis.get(`batch_role:${batchId}`);
            if (currentRole === 'MANUFACTURER') {
                await this.redis.set(`pending_batch_role:${batchId}`, 'LOGISTICS');
            } else if (currentRole === 'LOGISTICS') {
                await this.redis.set(`pending_batch_role:${batchId}`, 'RETAILER');
            }

            return tx.hash;
        } catch (error) {
            this.logger.error(`Failed to initiate transfer for ${batchId}: ${error.message}`, error.stack);
            throw new Error(`Transfer initiation failed: ${error.message}`);
        }
    }

    /**
     * Step 2: Accept Transfer (Smart Relayer)
     */
    async acceptTransfer(batchId: string): Promise<string> {
        if (this.isMockMode) {
            this.logger.log(`[MOCK] Accepting transfer of ${batchId}`);
            const state = this.mockStore.get(batchId);
            if (state && state.pendingOwner) {
                state.owner = state.pendingOwner;
                state.pendingOwner = null;
                this.mockStore.set(batchId, state);
            } else {
                this.logger.warn(`[MOCK] Cannot accept transfer: no pending owner for ${batchId}`);
                throw new Error(`No pending owner for ${batchId}`);
            }
            return `0xMOCK_ACCEPT_TRANSFER_${Date.now()}`;
        }

        try {
            const tokenId = ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]));
            const result = await this.contract.getBatchData(batchId);
            const pendingOwner = result[5] === '0x0000000000000000000000000000000000000000' ? null : result[5];

            if (!pendingOwner) {
                throw new Error(`No pending transfer found for batch ${batchId}`);
            }

            this.logger.log(`Accepting transfer for ${batchId}. Pending Owner: ${pendingOwner}`);

            let signer = this.manufacturerWallet;
            if (pendingOwner.toLowerCase() === this.logisticsWallet.address.toLowerCase()) {
                signer = this.logisticsWallet;
            } else if (pendingOwner.toLowerCase() === this.retailerWallet.address.toLowerCase()) {
                signer = this.retailerWallet;
            } else {
                this.logger.warn(`Unknown pending owner ${pendingOwner}. Trying with Manufacturer/Admin.`);
            }

            this.logger.log(`Signing acceptTransfer with ${signer.address}`);

            const tx = await this.executeTransaction(signer, () => 
                (this.contract.connect(signer as any) as any).acceptTransfer(tokenId)
            );

            // Single-wallet logic: finalize logical role
            const pendingRole = await this.redis.get(`pending_batch_role:${batchId}`);
            if (pendingRole) {
                await this.redis.set(`batch_role:${batchId}`, pendingRole);
                await this.redis.del(`pending_batch_role:${batchId}`);
            }

            return tx.hash;
        } catch (error) {
            this.logger.error(`Failed to accept transfer for ${batchId}: ${error.message}`, error.stack);
            throw new Error(`Transfer acceptance failed: ${error.message}`);
        }
    }

    async getBatchPublicData(batchId: string): Promise<{ exists: boolean; owner?: string; ownerRole?: string; pendingOwner?: string | null; pendingOwnerRole?: string | null; violation?: string | null; timestamp?: number }> {
        if (this.isMockMode) {
            const state = this.mockStore.get(batchId);
            if (!state) return { exists: false };

            const resolveMockRole = (addr: string) => {
                if (addr === '0xLogisticsAddress') return 'LOGISTICS';
                if (addr === '0xRetailerAddress') return 'RETAILER';
                return 'MANUFACTURER';
            };

            return {
                exists: true,
                owner: state.owner,
                ownerRole: resolveMockRole(state.owner),
                pendingOwner: state.pendingOwner,
                pendingOwnerRole: state.pendingOwner ? resolveMockRole(state.pendingOwner) : null,
                violation: state.violation,
                timestamp: state.timestamp
            };
        }

        try {
            // returns (owner, uri, violation, isViolated, timestamp, pendingOwner)
            const result = await this.contract.getBatchData(batchId);
            const owner = result[0];
            const pendingOwner = result[5] === '0x0000000000000000000000000000000000000000' ? null : result[5];

            const resolveRole = async (addr: string, isPending: boolean = false) => {
                if (!addr) return 'UNKNOWN';
                
                // Single Wallet Logic: Check Redis first
                const redisKey = isPending ? `pending_batch_role:${batchId}` : `batch_role:${batchId}`;
                const logicalRole = await this.redis.get(redisKey);
                if (logicalRole) return logicalRole;

                const lower = addr.toLowerCase();
                if (lower === this.manufacturerWallet.address.toLowerCase()) return 'MANUFACTURER';
                if (lower === this.logisticsWallet.address.toLowerCase()) return 'LOGISTICS';
                if (lower === this.retailerWallet.address.toLowerCase()) return 'RETAILER';
                return 'PARTNER';
            };

            const ownerRole = await resolveRole(owner, false);
            const pendingOwnerRole = pendingOwner ? await resolveRole(pendingOwner, true) : null;

            return {
                exists: true,
                owner: owner,
                ownerRole: ownerRole,
                violation: result[3] ? result[2] : null,
                timestamp: Number(result[4]) * 1000,
                pendingOwner: pendingOwner,
                pendingOwnerRole: pendingOwnerRole
            };
        } catch (error) {
            this.logger.error(`Failed to get batch data for ${batchId}`, error);
            return { exists: false };
        }
    }


    async getBatchHistory(batchId: string): Promise<any[]> {
        if (this.isMockMode) {
            return [
                { event: 'BatchCreated', stage: 'Производство', details: 'Партия создана и заверена в блокчейне', timestamp: Date.now() - 3600000, actor: 'Производитель' },
                { event: 'TransferCompleted', stage: 'Логистика', details: 'Владение передано логистической компании', timestamp: Date.now() - 1800000, actor: 'Логистический партнер' }
            ];
        }

        try {
            const allEvents = await this.collectHistoryLogs(batchId);

            // Resolve block timestamps and format
            const history = await Promise.all(allEvents.map(async (item) => {
                const log = item;
                const timestamp = item.timestamp;

                let stage = 'Process';
                let details = 'Blockchain event recorded';
                let actor = 'System';

                const resolveActor = (address: string) => {
                    const addr = address.toLowerCase();
                    if (addr === this.manufacturerWallet.address.toLowerCase()) return 'Производитель (Manufacturer)';
                    if (addr === this.logisticsWallet?.address.toLowerCase()) return 'Логистический партнер (Logistics)';
                    if (addr === this.retailerWallet?.address.toLowerCase()) return 'Ритейлер (Retailer)';
                    return `Участник (${address.substring(0, 6)}...)`;
                };

                switch (item.type) {
                    case 'BatchCreated':
                        stage = 'Производство';
                        details = 'Партия успешно создана и заверена в блокчейне (Notarized)';
                        actor = resolveActor(log.args[2]);
                        break;
                    case 'TransferInitiated':
                        stage = 'Транзит';
                        details = `Инициирована передача прав на партию участнику ${resolveActor(log.args[2])}`;
                        actor = resolveActor(log.args[1]);
                        break;
                    case 'TransferCompleted':
                        stage = 'Передача прав';
                        details = `Передача прав подтверждена. Текущий владелец: ${resolveActor(log.args[2])}`;
                        actor = resolveActor(log.args[2]);
                        break;
                    case 'ViolationReported':
                        stage = '🚨 НАРУШЕНИЕ';
                        details = `Зафиксировано нарушение условий SLA: ${log.args[1]}`;
                        actor = 'IoT Gateway (Autonomous Notary)';
                        break;
                }

                return {
                    event: item.type,
                    stage,
                    details,
                    actor,
                    timestamp,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash
                };
            }));

            return history.sort((a, b) => a.timestamp - b.timestamp);

        } catch (error) {
            this.logger.error(`Failed to fetch history for ${batchId}`, error);
            return [];
        }
    }

    /**
     * Collects all registry events for a batch without hitting RPC range limits.
     *
     * The scan starts at the block where the batch was created (found by binary search on
     * the on-chain creation time), walks forward in chunks the provider accepts, and keeps
     * the result plus the last scanned block in Redis so later requests only scan new blocks.
     */
    private async collectHistoryLogs(batchId: string): Promise<HistoryLog[]> {
        const cacheKey = `history:${batchId}`;
        let cache: { lastBlock: number; logs: HistoryLog[] } | null = null;
        try {
            const raw = await this.redis.get(cacheKey);
            if (raw) cache = JSON.parse(raw);
        } catch (e) {
            this.logger.warn(`History cache read failed for ${batchId}: ${e.message}`);
        }

        const latestBlock = await this.provider.getBlockNumber();
        let fromBlock: number;
        if (cache) {
            fromBlock = cache.lastBlock + 1;
        } else {
            const data = await this.contract.getBatchData(batchId);
            const createdAt = Number(data[4]);
            if (!createdAt) return []; // batch is not on-chain
            fromBlock = await this.findBlockByTimestamp(createdAt, latestBlock);
        }

        const logs = cache ? [...cache.logs] : [];
        const tokenIdTopic = ethers.zeroPadValue(ethers.toBeHex(ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]))), 32);
        const iface = this.contract.interface;
        const eventNames = ['BatchCreated', 'TransferInitiated', 'TransferCompleted', 'ViolationReported'];
        const topic0 = eventNames.map(name => iface.getEvent(name)!.topicHash);
        const contractAddress = await this.contract.getAddress();

        let scannedTo = fromBlock - 1;
        for (let chunk = 0; chunk < HISTORY_MAX_CHUNKS_PER_REQUEST && scannedTo < latestBlock; chunk++) {
            const from = scannedTo + 1;
            const to = Math.min(from + (this.usesX402 ? HISTORY_CHUNK_SIZE_X402 : HISTORY_CHUNK_SIZE) - 1, latestBlock);
            const rawLogs = await this.provider.getLogs({
                address: contractAddress,
                topics: [topic0, tokenIdTopic],
                fromBlock: from,
                toBlock: to,
            });
            for (const rawLog of rawLogs) {
                const parsed = iface.parseLog(rawLog);
                if (!parsed) continue;
                const block = await this.provider.getBlock(rawLog.blockNumber);
                logs.push({
                    type: parsed.name,
                    args: parsed.args.map((a: any) => a.toString()),
                    blockNumber: rawLog.blockNumber,
                    transactionHash: rawLog.transactionHash,
                    timestamp: block ? block.timestamp * 1000 : Date.now(),
                });
            }
            scannedTo = to;
        }

        if (scannedTo < latestBlock) {
            this.logger.warn(`History for ${batchId} is partial: scanned up to block ${scannedTo} of ${latestBlock}; the next request continues from there`);
        }

        try {
            await this.redis.set(cacheKey, JSON.stringify({ lastBlock: scannedTo, logs }), 'EX', HISTORY_CACHE_TTL_SECONDS);
        } catch (e) {
            this.logger.warn(`History cache write failed for ${batchId}: ${e.message}`);
        }
        return logs;
    }

    /** Returns the first block whose timestamp is >= `timestamp` (seconds). */
    private async findBlockByTimestamp(timestamp: number, latestBlock: number): Promise<number> {
        let lo = 0;
        let hi = latestBlock;
        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            const block = await this.provider.getBlock(mid);
            if (block && block.timestamp < timestamp) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }

    /** Reads the batch passport (owner company and IPFS metadata URI) from passport-service. */
    async getPassportBatch(batchId: string): Promise<{ manufacturer_id: string; token_uri?: string } | null> {
        const passportUrl = this.configService.get<string>('PASSPORT_SERVICE_URL');
        const apiKey = this.configService.get<string>('INTERNAL_API_KEY');
        if (!passportUrl || !apiKey) {
            throw new Error('PASSPORT_SERVICE_URL is not configured');
        }
        const res = await fetch(`${serviceBase(passportUrl)}/api/v1/batches/${encodeURIComponent(batchId)}`, {
            headers: { 'x-api-key': apiKey },
            signal: AbortSignal.timeout(5000),
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`passport-service returned ${res.status}`);
        return res.json();
    }

    async grantRole(role: string, targetAddress: string): Promise<string> {
        this.logger.log(`Granting Role ${role} to ${targetAddress}`);

        // Define role hashes (Must match Solidity `keccak256("ROLE_NAME")`)
        const ROLES: Record<string, string> = {
            'MANUFACTURER': ethers.keccak256(ethers.toUtf8Bytes("PRODUCER_ROLE")),
            'LOGISTICS': ethers.keccak256(ethers.toUtf8Bytes("LOGISTICS_ROLE")),
            'RETAILER': ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE")),
        };

        const roleHash = ROLES[role];
        if (!roleHash) {
            throw new Error(`Invalid Role: ${role}`);
        }

        if (this.isMockMode) {
            return `0xMOCK_GRANT_ROLE_${Date.now()}`;
        }

        try {
            // Only Default Admin (Manufacturer Wallet in this setup) can grant roles
            const tx = await this.executeTransaction(this.manufacturerWallet, () => 
                (this.contract.connect(this.manufacturerWallet) as any).grantRole(roleHash, targetAddress)
            );
            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to grant role', error);
            throw new Error(`Grant Role failed: ${error.message}`);
        }
    }

    async getAdminStatus() {
        if (this.isMockMode) {
            return {
                mode: 'MOCK',
                network: 'Simulation',
                contract: '0xMockContractAddress',
                wallets: [
                    { name: 'Manufacturer (Admin)', address: '0xProducerAddress', balance: '100.0 MATIC' },
                    { name: 'Logistics Partner', address: '0xLogisticsAddress', balance: '50.0 MATIC' },
                    { name: 'Retailer Partner', address: '0xRetailerAddress', balance: '25.0 MATIC' }
                ]
            };
        }

        const getBalSafe = async (address: string) => {
            try {
                const bal = await this.provider.getBalance(address);
                return `${ethers.formatEther(bal)} MATIC`;
            } catch (err) {
                this.logger.error(`Failed to get balance for ${address}: ${err.message}`);
                return "Error fetching";
            }
        };

        const [mBal, lBal, rBal] = await Promise.all([
            getBalSafe(this.manufacturerWallet.address),
            getBalSafe(this.logisticsWallet.address),
            getBalSafe(this.retailerWallet.address)
        ]);

        let networkName = 'Unknown Network';
        try {
            const net = await this.provider.getNetwork();
            networkName = net.name;
        } catch (err) {
            this.logger.error(`Failed to get network: ${err.message}`);
        }

        return {
            mode: 'LIVE',
            network: networkName,
            contract: await this.contract.getAddress(),
            wallets: [
                { name: 'Manufacturer (Admin)', address: this.manufacturerWallet.address, balance: mBal },
                { name: 'Logistics Partner', address: this.logisticsWallet.address, balance: lBal },
                { name: 'Retailer Partner', address: this.retailerWallet.address, balance: rBal }
            ]
        };
    }

    async advanceBatch(batchId: string, targetRole: 'LOGISTICS' | 'RETAILER'): Promise<{ txHash: string }> {
        this.logger.log(`Demo: Advancing batch ${batchId} to ${targetRole}`);

        if (this.isMockMode) {
            const state = this.mockStore.get(batchId);
            if (state) {
                state.owner = targetRole === 'LOGISTICS' ? '0xLogisticsAddress' : '0xRetailerAddress';
                state.pendingOwner = null;
                this.mockStore.set(batchId, state);
            }
            return { txHash: `0xMOCK_ADVANCE_${Date.now()}` };
        }

        try {
            // 0. Check if batch exists on chain
            const bcData = await this.getBatchPublicData(batchId);
            if (!bcData.exists) {
                this.logger.log(`Demo: Batch ${batchId} not on chain. Notarizing first...`);
                await this.createBatch(batchId, `ipfs://demo-metadata-${batchId}`);
            }

            // 1. Determine target address
            const targetAddress = targetRole === 'LOGISTICS' ? this.logisticsWallet.address : this.retailerWallet.address;

            // 2. Initiate
            const initTx = await this.initiateTransfer(batchId, targetAddress);
            this.logger.log(`Demo: Init TX: ${initTx}`);

            // 3. Accept
            const acceptTx = await this.acceptTransfer(batchId);
            this.logger.log(`Demo: Accept TX: ${acceptTx}`);

            return { txHash: acceptTx };
        } catch (error) {
            this.logger.error('Failed to advance batch in demo mode', error);
        }
    }

    async resetBatch(batchId: string): Promise<{ txHash: string }> {
        this.logger.log(`Demo: Resetting batch ${batchId}`);
        
        // 0. Coordinate internal service resets
        const iotUrl = this.configService.get<string>('IOT_SERVICE_URL');
        const passportUrl = this.configService.get<string>('PASSPORT_SERVICE_URL');
        const apiKey = this.configService.get<string>('INTERNAL_API_KEY');

        try {
            if (iotUrl && apiKey) {
                this.logger.log(`Demo: Resetting IoT state for ${batchId}`);
                await fetch(`${serviceBase(iotUrl)}/api/v1/demo/reset/${batchId}`, {
                    method: 'POST',
                    headers: { 'x-api-key': apiKey }
                });
            }

            if (passportUrl && apiKey) {
                this.logger.log(`Demo: Resetting Passport state for ${batchId}`);
                await fetch(`${serviceBase(passportUrl)}/api/v1/demo/reset/${batchId}`, {
                    method: 'POST',
                    headers: { 'x-api-key': apiKey }
                });
            }
        } catch (err) {
            this.logger.warn(`Demo: Internal service reset warning (non-fatal): ${err.message}`);
        }

        if (this.isMockMode) {
            this.mockStore.delete(batchId);
            return { txHash: `0xMOCK_RESET_${Date.now()}` };
        }

        try {
            const bcData = await this.getBatchPublicData(batchId);
            if (!bcData.exists) return { txHash: '0xNOT_NOTARIZED' };

            // 1. If there's a pending transfer, accept it to clear the state
            if (bcData.pendingOwner) {
                this.logger.log(`Demo: Pending transfer found for ${batchId}. Clearing it...`);
                await this.acceptTransfer(batchId);
            }

            // 2. Re-fetch status after clearing pending
            const updatedData = await this.getBatchPublicData(batchId);

            // 3. If owner is not Manufacturer, bring it back
            if (updatedData.ownerRole !== 'MANUFACTURER') {
                this.logger.log(`Demo: Batch owned by ${updatedData.ownerRole}. Returning to Manufacturer.`);
                await this.initiateTransfer(batchId, this.manufacturerWallet.address);
                const txHash = await this.acceptTransfer(batchId);
                return { txHash };
            }

            return { txHash: '0xDEMO_RESET_SUCCESS' };
        } catch (err) {
            this.logger.error(`Demo: Reset failure: ${err.message}`);
            throw new Error(`Reset failed: ${err.message}`);
        }
    }
}
