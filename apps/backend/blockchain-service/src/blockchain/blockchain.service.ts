import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

const REGISTRY_ABI = [
    "function registerBatch(string memory batchUUID, string memory dataHash) public",
    "event BatchRegistered(string batchUUID, string dataHash, address indexed notary, uint256 timestamp)",
    "function records(string memory batchUUID) public view returns (string memory ipfsHash, address notary, uint256 timestamp, bool exists)"
];

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: JsonRpcProvider;
    private notaryWallet: Wallet;
    private contract: Contract;
    private isMockMode: boolean = false;
    // Map stores: BatchID -> { registered: boolean, handover: boolean, violation: string | null }
    private mockStore = new Map<string, { registered: boolean; handover: boolean; violation: string | null }>();

    constructor(private configService: ConfigService) { }

    onModuleInit() {
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

    async notarizeBatch(batchId: string, dataHash: string): Promise<string> {
        this.logger.log(`Notarizing Batch ${batchId} with hash ${dataHash}`);

        if (this.isMockMode) {
            this.logger.log('[MOCK] Transaction sent to blockchain');
            const state = this.mockStore.get(batchId) || { registered: false, handover: false, violation: null };
            state.registered = true;
            this.mockStore.set(batchId, state);
            return `0xMOCK_TX_HASH_${Date.now()}`;
        }

        // ... Real implementation ...
        try {
            const tx = await this.contract.registerBatch(batchId, dataHash);
            this.logger.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);

            const receipt = await tx.wait();
            this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);

            return tx.hash;
        } catch (error) {
            this.logger.error('Blockchain transaction failed', error);
            throw new Error(`Blockchain registration failed: ${error.message}`);
        }
    }

    async registerViolation(batchId: string, details: string): Promise<string> {
        if (this.isMockMode) {
            const state = this.mockStore.get(batchId) || { registered: false, handover: false, violation: null };
            state.violation = details;
            this.mockStore.set(batchId, state);
            return `0xMOCK_VIOLATION_TX_${Date.now()}`;
        }
        // Real implementation would call contract.reportViolation(...)
        return '0x...';
    }

    async finalizeHandover(batchId: string): Promise<string> {
        if (this.isMockMode) {
            const state = this.mockStore.get(batchId) || { registered: false, handover: false, violation: null };
            state.handover = true;
            this.mockStore.set(batchId, state);
            return `0xMOCK_HANDOVER_TX_${Date.now()}`;
        }
        // Real implementation would call contract.finishHandover(...)
        return '0x...';
    }

    async getBatchStatus(batchId: string): Promise<{ exists: boolean; txHash?: string; timestamp?: number; handover?: boolean; violation?: string | null }> {
        if (this.isMockMode) {
            const state = this.mockStore.get(batchId);
            if (!state || !state.registered) return { exists: false };

            return {
                exists: true,
                txHash: `0xMOCK_TX_${batchId.substring(0, 8)}`,
                timestamp: Date.now(),
                handover: state.handover,
                violation: state.violation
            };
        }

        try {
            const result = await this.contract.records(batchId);
            // result is [ipfsHash, notary, timestamp, exists]
            const exists = result[3];

            if (!exists) {
                return { exists: false };
            }

            return {
                exists: true,
                txHash: '0x(verified-on-chain)',
                timestamp: Number(result[2]) * 1000,
                // Real contract fields for handover/violation would be mapped here
                handover: false,
                violation: null
            };
        } catch (error) {
            this.logger.error(`Failed to get batch status for ${batchId}`, error);
            return { exists: false };
        }
    }
}
