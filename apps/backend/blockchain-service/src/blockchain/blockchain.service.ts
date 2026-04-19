import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

const REGISTRY_ABI = [
    "function createBatch(string memory batchUUID, string memory tokenURI) public",
    "function initiateTransfer(uint256 tokenId, address to) public",
    "function acceptTransfer(uint256 tokenId) public",
    "function reportViolation(string memory batchUUID, string memory details) public",
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
            }
            return `0xMOCK_INIT_TRANSFER_${Date.now()}`;
        }

        try {
            // We need to fetch current owner to decide who signs? 
            // For now, assuming linear flow: Manufacturer -> Logistics -> Retailer
            // But better: The valid owner should sign.
            // Simplified: We assume initiate is always valid call if UI allows it.
            // But we must sign with the CURRENT OWNER.
            // Let's check ownership first.

            const tokenId = ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]));
            const batchData = await this.contract.getBatchData(batchId);
            const currentOwner = batchData.currentOwner;

            let signer = this.manufacturerWallet;
            if (currentOwner === this.logisticsWallet.address) signer = this.logisticsWallet;
            if (currentOwner === this.retailerWallet.address) signer = this.retailerWallet;

            this.logger.log(`Initiating transfer of ${batchId} to ${toAddress}. Signer: ${signer.address}`);

            const tx = await (this.contract.connect(signer) as any).initiateTransfer(tokenId, toAddress);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to initiate transfer', error);
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
            }
            return `0xMOCK_ACCEPT_TRANSFER_${Date.now()}`;
        }

        try {
            const tokenId = ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]));
            const batchData = await this.contract.getBatchData(batchId);
            const pendingOwner = batchData.pendingOwner;

            this.logger.log(`Accepting transfer for ${batchId}. Pending Owner: ${pendingOwner}`);

            let signer = this.manufacturerWallet;
            if (pendingOwner === this.logisticsWallet.address) {
                signer = this.logisticsWallet;
            } else if (pendingOwner === this.retailerWallet.address) {
                signer = this.retailerWallet;
            } else {
                this.logger.warn(`Unknown pending owner ${pendingOwner}. Trying with Manufacturer/Admin.`);
            }

            this.logger.log(`Signing acceptTransfer with ${signer.address}`);

            const tx = await (this.contract.connect(signer as any) as any).acceptTransfer(tokenId);
            this.logger.log(`Transfer accepted: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to accept transfer', error);
            throw new Error(`Transfer acceptance failed: ${error.message}`);
        }
    }

    async getBatchPublicData(batchId: string): Promise<{ exists: boolean; owner?: string; pendingOwner?: string | null; violation?: string | null; timestamp?: number }> {
        if (this.isMockMode) {
            const state = this.mockStore.get(batchId);
            if (!state) return { exists: false };

            return {
                exists: true,
                owner: state.owner,
                pendingOwner: state.pendingOwner,
                violation: state.violation,
                timestamp: state.timestamp
            };
        }

        try {
            // returns (owner, uri, violation, isViolated, timestamp, pendingOwner)
            const result = await this.contract.getBatchData(batchId);

            return {
                exists: true,
                owner: result[0],
                violation: result[3] ? result[2] : null,
                timestamp: Number(result[4]) * 1000,
                pendingOwner: result[5] === '0x0000000000000000000000000000000000000000' ? null : result[5]
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
}
