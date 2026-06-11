import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('No Bearer token found in Authorization header');
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request['user'] = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || (decodedToken.admin ? 'admin' : 'user'),
      };
      
      // Inject verified role for downstream use if needed
      request.headers['x-verified-role'] = request['user'].role.toUpperCase();
      
      // Inject verified company ID if present
      if (decodedToken.company_id) {
        request.headers['x-verified-company-id'] = decodedToken.company_id;
      }
      
      return true;
    } catch (error) {
      this.logger.error(`JWT Verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
