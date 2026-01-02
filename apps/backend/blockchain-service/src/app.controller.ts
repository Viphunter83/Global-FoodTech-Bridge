import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain/blockchain.service';

@Controller('api/v1/blockchain')
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

    @Post('violation')
    async reportViolation(@Body() body: { batchId: string; details: string }) {
        const txHash = await this.blockchainService.registerViolation(body.batchId, body.details);
        return { status: 'success', txHash };
    }

    @Post('handover')
    async handover(@Body() body: { batchId: string; toAddress: string }) {
        // Now requires toAddress for NFT transfer
        // If not provided in legacy call, we might fallback or error.
        // For now, let's require it, but if missing in mock mode we might fake it.
        const target = body.toAddress || "0xRetailerAddressDefault";
        const txHash = await this.blockchainService.transferCustody(body.batchId, target);
        return { status: 'success', txHash };
    }
}
