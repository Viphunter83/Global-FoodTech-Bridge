import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

const REGISTRY_ABI = [
    "function createBatch(string memory batchUUID, string memory tokenURI) public",
    "function transferCustody(address to, uint256 tokenId) public",
    "function reportViolation(string memory batchUUID, string memory details) public",
    "function getBatchData(string memory batchUUID) public view returns (address currentOwner, string memory uri, string memory violation, bool isViolated, uint256 timestamp)",
    "event BatchCreated(uint256 indexed tokenId, string batchUUID, address indexed producer, uint256 timestamp)",
    "event BatchCustodyTransferred(uint256 indexed tokenId, address from, address to, uint256 timestamp)",
    "event ViolationReported(uint256 indexed tokenId, string details, address indexed reporter, uint256 timestamp)"
];

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: JsonRpcProvider;
    private notaryWallet: Wallet;
    private contract: Contract;
    private isMockMode: boolean = false;

    // Mock Store: BatchUUID -> { owner: string, uri: string, violation: string | null, timestamp: number }
    private mockStore = new Map<string, { owner: string; uri: string; violation: string | null; timestamp: number }>();

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

    /**
     * Mints a new Batch NFT.
     * Replaces old 'registerBatch'.
     */
    async createBatch(batchId: string, ipfsUri: string): Promise<string> {
        this.logger.log(`Creating Batch NFT ${batchId} with URI ${ipfsUri}`);

        if (this.isMockMode) {
            this.logger.log('[MOCK] Minting Batch NFT...');
            this.mockStore.set(batchId, {
                owner: '0xProducerAddress', // In mock, we assume caller is producer
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
     * Transfers token from current owner to new owner (e.g. Retailer).
     * Replaces old 'finalizeHandover'.
     */
    async transferCustody(batchId: string, toAddress: string): Promise<string> {
        // We calculate TokenID from BatchID in logic if needed, but contract maps string->tokenID
        // In real web3 app, we'd need to know the tokenId. The contract helper 'uuidToTokenId' helps.
        // But for 'transferCustody' we need TokenID.
        // Wait, our Solidity 'transferCustody' takes (to, tokenId).
        // We need a helper to get tokenId from UUID if we only have UUID.

        // For simplicity in this service, let's assume we can compute it or look it up.
        // Since keccak256 is standard, we can compute it here or ask contract.

        if (this.isMockMode) {
            this.logger.log(`[MOCK] Transferring custody of ${batchId} to ${toAddress}`);
            const state = this.mockStore.get(batchId);
            if (state) {
                state.owner = toAddress;
                this.mockStore.set(batchId, state);
            }
            return `0xMOCK_TRANSFER_TX_${Date.now()}`;
        }

        try {
            // Need to lookup ID first.
            // In a real optimized app, we index this. Here we might need a contract call if we don't compute locally.
            // Let's compute locally matching solidity: uint256(keccak256(abi.encodePacked(batchUUID)))
            const tokenId = ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [batchId]));

            const tx = await this.contract.transferCustody(toAddress, tokenId);
            this.logger.log(`Custody transfer initiated: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            this.logger.error('Failed to transfer custody', error);
            throw new Error(`Custody transfer failed: ${error.message}`);
        }
    }

    async getBatchPublicData(batchId: string): Promise<{ exists: boolean; owner?: string; violation?: string | null; timestamp?: number }> {
        if (this.isMockMode) {
            const state = this.mockStore.get(batchId);
            if (!state) return { exists: false };

            return {
                exists: true,
                owner: state.owner,
                violation: state.violation,
                timestamp: state.timestamp
            };
        }

        try {
            // returns (owner, uri, violation, isViolated, timestamp)
            const result = await this.contract.getBatchData(batchId);

            // result[0] is owner address. If it's 0x0... it doesn't exist (or handled by require/revert in contract)
            // The contract function requires existence, so it will revert if not found.

            return {
                exists: true,
                owner: result[0],
                violation: result[3] ? result[2] : null, // if isViolated is true, return details
                timestamp: Number(result[4]) * 1000
            };
        } catch (error) {
            this.logger.error(`Failed to get batch data for ${batchId}`, error);
            return { exists: false };
        }
    }
}
