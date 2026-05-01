import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain/blockchain.service';

@Controller('blockchain')
export class AppController {
    constructor(
        private readonly blockchainService: BlockchainService
    ) { }

    @Post('notarize')
    async notarize(@Body() body: { batchId: string; dataHash: string }) {
        // 'dataHash' is now treated as 'tokenURI' for NFT metadata
        const txHash = await this.blockchainService.createBatch(body.batchId, body.dataHash);
        return { status: 'success', txHash };
    }

    @Get('status/:batchId')
    async getStatus(@Param('batchId') batchId: string) {
        return this.blockchainService.getBatchPublicData(batchId);
    }

    @Get('history/:batchId')
    async getHistory(@Param('batchId') batchId: string) {
        return this.blockchainService.getBatchHistory(batchId);
    }

    @Post('violation')
    async reportViolation(@Body() body: { batchId: string; details: string }) {
        const txHash = await this.blockchainService.registerViolation(body.batchId, body.details);
        return { status: 'success', txHash };
    }

    @Post('transfer/initiate')
    async initiateTransfer(@Body() body: { batchId: string; toAddress: string }) {
        if (!body.toAddress || !body.toAddress.startsWith('0x')) {
            throw new Error('Valid toAddress (0x...) is required for transfer initiation');
        }
        const txHash = await this.blockchainService.initiateTransfer(body.batchId, body.toAddress);
        return { status: 'success', txHash };
    }

    @Post('transfer/accept')
    async acceptTransfer(@Body() body: { batchId: string }) {
        const txHash = await this.blockchainService.acceptTransfer(body.batchId);
        return { status: 'success', txHash };
    }

    @Get('admin/status')
    async getAdminStatus() {
        return this.blockchainService.getAdminStatus();
    }
}
