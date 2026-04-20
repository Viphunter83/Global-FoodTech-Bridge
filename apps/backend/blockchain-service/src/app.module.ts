import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { IpfsController } from './ipfs/ipfs.controller';
import { IpfsService } from './ipfs/ipfs.service';
import { AdminController } from './admin/admin.controller';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './auth/api-key.guard';
import { BlockchainModule } from './blockchain/blockchain.module';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
                try {
                    const url = new URL(redisUrl);
                    return {
                        connection: {
                            host: url.hostname || 'localhost',
                            port: parseInt(url.port) || 6379,
                            password: url.password || undefined,
                            username: url.username || undefined,
                        },
                    };
                } catch (e) {
                    // Fallback to simple host if not a valid URL
                    return {
                        connection: {
                            host: redisUrl.split(':')[0] || 'localhost',
                            port: parseInt(redisUrl.split(':')[1]) || 6379,
                        },
                    };
                }
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
