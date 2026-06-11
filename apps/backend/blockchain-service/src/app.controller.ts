import { Body, Controller, Post, Get, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { BlockchainService } from './blockchain/blockchain.service';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { RolesGuard, Roles } from './auth/roles.guard';

@Controller('blockchain')
export class AppController {
    constructor(
        private readonly blockchainService: BlockchainService
    ) { }

    @Post('notarize')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('MANUFACTURER', 'ADMIN')
    async notarize(@Body() body: { batchId: string; dataHash: string }) {
        try {
            // 'dataHash' is now treated as 'tokenURI' for NFT metadata
            const txHash = await this.blockchainService.createBatch(body.batchId, body.dataHash);
            return { status: 'success', txHash };
        } catch (error) {
            throw new HttpException({
                status: 'error',
                message: error.message,
                details: error.stack
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('RETAILER', 'LOGISTICS', 'ADMIN')
    async reportViolation(@Body() body: { batchId: string; details: string }) {
        try {
            return await this.blockchainService.reportViolationAsync(body.batchId, body.details);
        } catch (error) {
            throw new HttpException({
                status: 'error',
                message: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('transfer/initiate')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('MANUFACTURER', 'LOGISTICS', 'ADMIN')
    async initiateTransfer(@Body() body: { batchId: string; toAddress: string }) {
        if (!body.toAddress || !body.toAddress.startsWith('0x')) {
            throw new HttpException('Valid toAddress (0x...) is required for transfer initiation', HttpStatus.BAD_REQUEST);
        }
        try {
            const txHash = await this.blockchainService.initiateTransfer(body.batchId, body.toAddress);
            return { status: 'success', txHash };
        } catch (error) {
            throw new HttpException({
                status: 'error',
                message: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('transfer/accept')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('LOGISTICS', 'RETAILER', 'ADMIN')
    async acceptTransfer(@Body() body: { batchId: string }) {
        try {
            const txHash = await this.blockchainService.acceptTransfer(body.batchId);
            return { status: 'success', txHash };
        } catch (error) {
            throw new HttpException({
                status: 'error',
                message: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('admin/status')
    async getAdminStatus() {
        return this.blockchainService.getAdminStatus();
    }

    @Post('demo/advance')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async advanceBatch(@Body() body: { batchId: string; targetRole: 'LOGISTICS' | 'RETAILER' }) {
        return this.blockchainService.advanceBatch(body.batchId, body.targetRole);
    }

    @Post('demo/reset')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async resetBatch(@Body() body: { batchId: string }) {
        return this.blockchainService.resetBatch(body.batchId);
    }
}
