import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain/blockchain.service';
import { IpfsController } from './ipfs/ipfs.controller';
import { IpfsService } from './ipfs/ipfs.service';
import { AdminController } from './admin/admin.controller';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [AppController, IpfsController, AdminController],
    providers: [BlockchainService, IpfsService],
})
export class AppModule { }
