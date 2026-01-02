import { Body, Controller, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain/blockchain.service';

@Controller('api/v1/blockchain')
export class AppController {
    constructor(private readonly blockchainService: BlockchainService) { }

    @Post('notarize')
    async notarize(@Body() body: { batchId: string; dataHash: string }) {
        const txHash = await this.blockchainService.notarizeBatch(body.batchId, body.dataHash);
        return {
            status: 'success',
            txHash: txHash,
        };
    }
}
