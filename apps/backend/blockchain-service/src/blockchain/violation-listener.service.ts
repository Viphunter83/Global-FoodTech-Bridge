import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ViolationStreamListener implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ViolationStreamListener.name);
    private redis: Redis;
    private isRunning = true;

    constructor(
        private readonly blockchainService: BlockchainService,
        private readonly configService: ConfigService,
    ) {
        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://redis:6379';
        this.redis = new Redis(redisUrl);
    }

    async onModuleInit() {
        this.logger.log('Starting Violation Stream Listener...');
        this.listen();
    }

    async onModuleDestroy() {
        this.isRunning = false;
        await this.redis.quit();
    }

    private async listen() {
        const streamKey = 'batch:violations';
        const groupName = 'blockchain-service-group';
        const consumerName = 'consumer-1';

        // 1. Create Consumer Group (if not exists)
        try {
            await this.redis.xgroup('CREATE', streamKey, groupName, '0', 'MKSTREAM');
        } catch (e) {
            // Group already exists, ignore
        }

        while (this.isRunning) {
            try {
                // XREADGROUP BLOCK 5000 ...
                const entries = await this.redis.xreadgroup(
                    'GROUP', groupName, consumerName,
                    'COUNT', '1',
                    'BLOCK', '5000',
                    'STREAMS', streamKey,
                    '>'
                );

                if (entries) {
                    for (const [stream, messages] of (entries as any)) {
                        for (const [id, [_, payload]] of (messages as any)) {
                            await this.processMessage(id, payload);
                            // Acknowledge
                            await this.redis.xack(streamKey, groupName, id);
                        }
                    }
                }
            } catch (error) {
                this.logger.error(`Error reading from stream: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    private async processMessage(id: string, payloadStr: string) {
        try {
            const event = JSON.parse(payloadStr);
            this.logger.log(`Processing violation event for batch: ${event.batch_id}`);
            
            // Call blockchain service with retry logic managed internally or here
            await this.blockchainService.registerViolation(event.batch_id, event.message);
            
            this.logger.log(`Successfully processed event ${id}`);
        } catch (e) {
            this.logger.error(`Failed to process message ${id}: ${e.message}`);
            // In a production system, we might move this to a DLQ or retry later
        }
    }
}
