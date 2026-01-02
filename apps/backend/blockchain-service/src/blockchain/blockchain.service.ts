import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

const REGISTRY_ABI = [
    "function registerBatch(string memory batchUUID, string memory dataHash) public",
    "function reportViolation(string memory batchUUID, string memory details) public",
    "function finalizeHandover(string memory batchUUID) public",
    "event BatchRegistered(string batchUUID, string dataHash, address indexed notary, uint256 timestamp)",
    "event BatchHandover(string batchUUID, address indexed notary, uint256 timestamp)",
    "event BatchViolation(string batchUUID, string details, address indexed notary, uint256 timestamp)",
    "function records(string memory batchUUID) public view returns (string memory ipfsHash, address notary, uint256 timestamp, bool exists, bool handedOver, string memory violationDetails)"
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
            this.logger.warn(`[MOCK] Reporting Violation for ${batchId}: ${details}`);
            const state = this.mockStore.get(batchId) || { registered: false, handover: false, violation: null };
            state.violation = details;
            // Ensure batch exists in mock store even if not registered via flow (for testing)
            if (!state.registered) {
                this.logger.warn(`[MOCK] Batch ${batchId} was not registered, auto-registering for test.`);
                state.registered = true;
            }
            this.mockStore.set(batchId, state);
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

    async finalizeHandover(batchId: string): Promise<string> {
        if (this.isMockMode) {
            this.logger.log(`[MOCK] Finalizing Handover for ${batchId}`);
            const state = this.mockStore.get(batchId) || { registered: false, handover: false, violation: null };
            state.handover = true;
            // Ensure batch exists in mock store
            if (!state.registered) {
                this.logger.warn(`[MOCK] Batch ${batchId} was not registered, auto-registering for test.`);
                state.registered = true;
            }
            this.mockStore.set(batchId, state);
            return `0xMOCK_HANDOVER_TX_${Date.now()}`;
        }

        try {
            const tx = await this.contract.finalizeHandover(batchId);
            this.logger.log(`Handover finalized: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to finalize handover', error);
            throw new Error(`Blockchain handover failed: ${error.message}`);
        }
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
            // result is [ipfsHash, notary, timestamp, exists, handedOver, violationDetails]
            const result = await this.contract.records(batchId);
            const exists = result[3];

            if (!exists) {
                return { exists: false };
            }

            return {
                exists: true,
                txHash: '0x(verified-on-chain)',
                timestamp: Number(result[2]) * 1000,
                handover: result[4],
                violation: result[5] && result[5] !== "" ? result[5] : null
            };
        } catch (error) {
            this.logger.error(`Failed to get batch status for ${batchId}`, error);
            // Default to false if error, or throw depending on requirement.
            return { exists: false };
        }
    }
}
