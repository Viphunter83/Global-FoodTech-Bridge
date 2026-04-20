import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ViolationStreamListener } from './violation-listener.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'violations',
        }),
    ],
    providers: [BlockchainService, ViolationStreamListener],
    exports: [BlockchainService, BullModule],
})
export class BlockchainModule {}
