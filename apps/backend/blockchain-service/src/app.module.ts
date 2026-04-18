import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain/blockchain.service';
import { IpfsController } from './ipfs/ipfs.controller';
import { IpfsService } from './ipfs/ipfs.service';
import { AdminController } from './admin/admin.controller';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './auth/api-key.guard';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [AppController, IpfsController, AdminController],
    providers: [
        BlockchainService, 
        IpfsService,
        {
            provide: APP_GUARD,
            useClass: ApiKeyGuard,
        },
    ],
})
export class AppModule { }
