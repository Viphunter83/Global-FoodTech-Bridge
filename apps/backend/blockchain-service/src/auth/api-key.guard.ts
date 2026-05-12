import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual, createHash } from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private configService: ConfigService) {}

  /**
   * Performs a constant-time comparison of two strings to prevent timing attacks.
   * Hashes both values first to ensure equal-length buffers.
   */
  private secureCompare(a: string, b: string): boolean {
    const hashA = createHash('sha256').update(a).digest();
    const hashB = createHash('sha256').update(b).digest();
    return timingSafeEqual(hashA, hashB);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path;

    // Allow health check endpoints without API key
    if (path?.includes('/health')) {
      return true;
    }

    const apiKey = request.headers['x-api-key'];
    const secretKey = this.configService.get<string>('INTERNAL_API_KEY');

    // SECURITY: Fail closed — if no key is configured, deny all requests
    if (!secretKey) {
      this.logger.error('CRITICAL: INTERNAL_API_KEY not set. Denying all requests for safety.');
      throw new ServiceUnavailableException('Service misconfigured');
    }

    if (apiKey && this.secureCompare(apiKey, secretKey)) {
      return true;
    }

    this.logger.warn(`[AUTH] Denied: ${request.method} ${path} from ${request.ip}. Key len: ${apiKey?.length ?? 0}`);
    throw new UnauthorizedException('Invalid or missing API Key');
  }
}
