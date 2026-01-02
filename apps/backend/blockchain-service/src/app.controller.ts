import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain/blockchain.service';

@Controller('api/v1/blockchain')
export class AppController {
    constructor(
        private readonly blockchainService: BlockchainService
    ) { }

    @Post('notarize')
    async notarize(@Body() body: { batchId: string; dataHash: string }) {
        const txHash = await this.blockchainService.notarizeBatch(body.batchId, body.dataHash);
        return { status: 'success', txHash };
    }

    @Get('status/:batchId')
    async getStatus(@Param('batchId') batchId: string) {
        return this.blockchainService.getBatchStatus(batchId);
    }

    @Post('violation')
    async reportViolation(@Body() body: { batchId: string; details: string }) {
        const txHash = await this.blockchainService.registerViolation(body.batchId, body.details);
        return { status: 'success', txHash };
    }

    @Post('handover')
    async handover(@Body() body: { batchId: string }) {
        const txHash = await this.blockchainService.finalizeHandover(body.batchId);
        return { status: 'success', txHash };
    }
}
