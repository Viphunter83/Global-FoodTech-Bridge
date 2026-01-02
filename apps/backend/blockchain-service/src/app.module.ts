import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain/blockchain.service';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [AppController],
    providers: [BlockchainService],
})
export class AppModule { }
