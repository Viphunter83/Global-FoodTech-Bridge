import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';
import Redis from 'ioredis';

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

    // Mock Store
    private mockStore = new Map<string, { owner: string; pendingOwner: string | null; uri: string; violation: string | null; timestamp: number }>();

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const rpcUrl = this.configService.get<string>('RPC_URL');
        const privateKey = this.configService.get<string>('PRIVATE_KEY'); // Should be Manufacturer
        const logisticsKey = this.configService.get<string>('LOGISTICS_KEY');
        const retailerKey = this.configService.get<string>('RETAILER_KEY');
        const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        this.redis = new Redis(redisUrl);

        if (!rpcUrl || !privateKey || !contractAddress) {
            this.logger.warn('Blockchain config missing. Starting in MOCK mode.');
            this.isMockMode = true;
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            // Initialize All Custodial Wallets
            this.manufacturerWallet = new ethers.Wallet(privateKey, this.provider);
            this.logisticsWallet = logisticsKey ? new ethers.Wallet(logisticsKey, this.provider) : this.manufacturerWallet;
            this.retailerWallet = retailerKey ? new ethers.Wallet(retailerKey, this.provider) : this.manufacturerWallet;

            // Default contract connected to Manufacturer (Admin)
            this.contract = new ethers.Contract(contractAddress, REGISTRY_ABI, this.manufacturerWallet);

            this.logger.log(`Blockchain Service Initialized on ${rpcUrl.includes('amoy') ? 'Polygon Amoy' : 'Polygon Mainnet'}`);
            this.logger.log(`- Manufacturer: ${this.manufacturerWallet.address}`);
            this.logger.log(`- Logistics: ${this.logisticsWallet.address}`);
            this.logger.log(`- Retailer: ${this.retailerWallet.address}`);

        } catch (error) {
            this.logger.error('Failed to initialize blockchain connection', error);
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
            const tx = await (this.contract.connect(this.manufacturerWallet) as any).createBatch(batchId, ipfsUri);
            this.logger.log(`Mint Transaction sent: ${tx.hash}`);
            await tx.wait();
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
            const tx = await this.contract.reportViolation(batchId, details);
            this.logger.log(`Violation reported: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to report violation', error);
            throw new Error(`Blockchain violation report failed: ${error.message}`);
        }
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

            const tx = await (this.contract.connect(signer) as any).initiateTransfer(tokenId, toAddress);
            this.logger.log(`Initiate Transaction sent: ${tx.hash}`);
            await tx.wait();

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

            const tx = await (this.contract.connect(signer as any) as any).acceptTransfer(tokenId);
            this.logger.log(`Transfer accepted: ${tx.hash}`);
            await tx.wait();

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
                pendingOwnerRole: pendingOwner ? resolveRole(pendingOwner) : null
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
            const tokenId = ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]));
            const filter = {
                address: await this.contract.getAddress(),
                fromBlock: 0,
                toBlock: 'latest',
            };

            // Query events
            const [created, transfers, completed, violations] = await Promise.all([
                this.contract.queryFilter(this.contract.filters.BatchCreated(tokenId)),
                this.contract.queryFilter(this.contract.filters.TransferInitiated(tokenId)),
                this.contract.queryFilter(this.contract.filters.TransferCompleted(tokenId)),
                this.contract.queryFilter(this.contract.filters.ViolationReported(tokenId))
            ]);

            const allEvents = [
                ...created.map(e => ({ type: 'BatchCreated', log: e })),
                ...transfers.map(e => ({ type: 'TransferInitiated', log: e })),
                ...completed.map(e => ({ type: 'TransferCompleted', log: e })),
                ...violations.map(e => ({ type: 'ViolationReported', log: e }))
            ];

            // Resolve block timestamps and format
            const history = await Promise.all(allEvents.map(async (item) => {
                const log = item.log as any;
                const block = await this.provider.getBlock(log.blockNumber);
                const timestamp = block ? block.timestamp * 1000 : Date.now();

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
            const tx = await (this.contract.connect(this.manufacturerWallet) as any).grantRole(roleHash, targetAddress);
            this.logger.log(`Grant Role TX: ${tx.hash}`);
            await tx.wait();
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

        const [mBal, lBal, rBal] = await Promise.all([
            this.provider.getBalance(this.manufacturerWallet.address),
            this.provider.getBalance(this.logisticsWallet.address),
            this.provider.getBalance(this.retailerWallet.address)
        ]);

        return {
            mode: 'LIVE',
            network: (await this.provider.getNetwork()).name,
            contract: await this.contract.getAddress(),
            wallets: [
                { name: 'Manufacturer (Admin)', address: this.manufacturerWallet.address, balance: `${ethers.formatEther(mBal)} MATIC` },
                { name: 'Logistics Partner', address: this.logisticsWallet.address, balance: `${ethers.formatEther(lBal)} MATIC` },
                { name: 'Retailer Partner', address: this.retailerWallet.address, balance: `${ethers.formatEther(rBal)} MATIC` }
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
