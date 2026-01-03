import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

const REGISTRY_ABI = [
    "function createBatch(string memory batchUUID, string memory tokenURI) public",
    "function initiateTransfer(uint256 tokenId, address to) public",
    "function acceptTransfer(uint256 tokenId) public",
    "function reportViolation(string memory batchUUID, string memory details) public",
    "function getBatchData(string memory batchUUID) public view returns (address currentOwner, string memory uri, string memory violation, bool isViolated, uint256 timestamp, address pendingOwner)",
    "event BatchCreated(uint256 indexed tokenId, string batchUUID, address indexed producer, uint256 timestamp)",
    "event TransferInitiated(uint256 indexed tokenId, address indexed from, address indexed to)",
    "event TransferCompleted(uint256 indexed tokenId, address indexed from, address indexed to)",
    "event ViolationReported(uint256 indexed tokenId, string details, address indexed reporter, uint256 timestamp)"
];

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: JsonRpcProvider;
    private notaryWallet: Wallet;
    private contract: Contract;
    private isMockMode: boolean = false;

    // Mock Store: BatchUUID -> { owner: string, pendingOwner: string | null, uri: string, violation: string | null, timestamp: number }
    private mockStore = new Map<string, { owner: string; pendingOwner: string | null; uri: string; violation: string | null; timestamp: number }>();

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        // ... (Init logic same as before, omitted for brevity if no changes needed, but replace_file_content needs full block usually or smart referencing)
        // Re-implementing init logic for safety in replacement block
        const rpcUrl = this.configService.get<string>('RPC_URL');
        const privateKey = this.configService.get<string>('PRIVATE_KEY');
        const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

        if (!rpcUrl || !privateKey || !contractAddress) {
            this.logger.warn('Blockchain config missing. Starting in MOCK mode.');
            this.isMockMode = true;
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.notaryWallet = new ethers.Wallet(privateKey, this.provider);
            this.contract = new ethers.Contract(contractAddress, REGISTRY_ABI, this.notaryWallet);
            this.logger.log('Blockchain Service Initialized (Polygon/Ethereum)');
        } catch (error) {
            this.logger.error('Failed to initialize blockchain connection', error);
            this.isMockMode = true;
        }
    }

    async createBatch(batchId: string, ipfsUri: string): Promise<string> {
        this.logger.log(`Creating Batch NFT ${batchId} with URI ${ipfsUri}`);

        if (this.isMockMode) {
            this.logger.log('[MOCK] Minting Batch NFT...');
            this.mockStore.set(batchId, {
                owner: '0xProducerAddress',
                pendingOwner: null,
                uri: ipfsUri,
                violation: null,
                timestamp: Date.now()
            });
            return `0xMOCK_MINT_TX_${Date.now()}`;
        }

        try {
            const tx = await this.contract.createBatch(batchId, ipfsUri);
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
            const tokenId = ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]));
            const tx = await this.contract.initiateTransfer(tokenId, toAddress);
            this.logger.log(`Transfer initiated: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to initiate transfer', error);
            throw new Error(`Transfer initiation failed: ${error.message}`);
        }
    }

    /**
     * Step 2: Accept Transfer
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
            const tx = await this.contract.acceptTransfer(tokenId);
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
}
