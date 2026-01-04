import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

interface GrantRoleDto {
    role: string;
    targetAddress: string;
}

@Controller('admin')
export class AdminController {
    private readonly logger = new Logger(AdminController.name);

    constructor(private readonly blockchainService: BlockchainService) { }

    @Post('grant-role')
    async grantRole(@Body() body: GrantRoleDto) {
        if (!body.role || !body.targetAddress) {
            throw new HttpException('Missing role or targetAddress', HttpStatus.BAD_REQUEST);
        }

        try {
            const txHash = await this.blockchainService.grantRole(body.role, body.targetAddress);
            return {
                status: 'success',
                txHash,
                message: `Granted ${body.role} to ${body.targetAddress}`
            };
        } catch (error) {
            this.logger.error(error.message);
            throw new HttpException(error.message || 'Failed to grant role', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
