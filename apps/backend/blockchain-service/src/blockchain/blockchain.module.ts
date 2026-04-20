import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BlockchainService } from './blockchain.service';
import { ViolationStreamListener } from './violation-listener.service';

@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: () => ({
                connection: {
                    host: process.env.REDIS_HOST || 'redis',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                },
            }),
        }),
        BullModule.registerQueue({
            name: 'violations',
        }),
    ],
    providers: [BlockchainService, ViolationStreamListener],
    exports: [BlockchainService, BullModule],
})
export class BlockchainModule {}
