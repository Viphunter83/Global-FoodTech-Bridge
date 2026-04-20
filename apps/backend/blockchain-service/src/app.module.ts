import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain/blockchain.service';
import { IpfsController } from './ipfs/ipfs.controller';
import { IpfsService } from './ipfs/ipfs.service';
import { AdminController } from './admin/admin.controller';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './auth/api-key.guard';

import { BlockchainModule } from './blockchain/blockchain.module';

import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL') || 'redis://redis:6379';
                const url = new URL(redisUrl);
                return {
                    connection: {
                        host: url.hostname,
                        port: parseInt(url.port) || 6379,
                        password: url.password,
                    },
                };
            },
        }),
        BlockchainModule,
    ],
    controllers: [AppController, IpfsController, AdminController, HealthController],
    providers: [
        IpfsService,
        {
            provide: APP_GUARD,
            useClass: ApiKeyGuard,
        },
    ],
})
export class AppModule { }
