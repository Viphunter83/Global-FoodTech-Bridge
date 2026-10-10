import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // No user token: the global ApiKeyGuard has already authenticated the caller as a
    // trusted internal service. It gets the limited SERVICE role, never ADMIN, so a
    // leaked service key cannot be used to act on behalf of users.
    if (!authHeader) {
      request['user'] = { uid: 'internal-service', role: 'SERVICE' };
      request.headers['x-verified-role'] = 'SERVICE';
      return true;
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request['user'] = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'PENDING',
        companyId: decodedToken.company_id || decodedToken.companyId || null,
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
