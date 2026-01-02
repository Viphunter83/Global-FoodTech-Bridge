import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

const REGISTRY_ABI = [
    "function registerBatch(string memory batchUUID, string memory dataHash) public",
    "event BatchRegistered(string batchUUID, string dataHash, address indexed notary, uint256 timestamp)"
];

@Injectable()
export class BlockchainService implements OnModuleInit {
    private readonly logger = new Logger(BlockchainService.name);
    private provider: JsonRpcProvider;
    private notaryWallet: Wallet;
    private contract: Contract;
    private isMockMode: boolean = false;

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
            return `0xMOCK_TX_HASH_${Date.now()}`;
        }

        try {
            // Call the smart contract
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
}
