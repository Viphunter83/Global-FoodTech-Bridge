import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const projectId = configService.get<string>('FIREBASE_PROJECT_ID') || 'global-foodtech-bridge-prod';
        if (admin.apps.length === 0) {
          admin.initializeApp({
            projectId: projectId,
          });
        }
        return admin;
      },
    },
    FirebaseAuthGuard,
    RolesGuard,
  ],
  exports: ['FIREBASE_ADMIN', FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
