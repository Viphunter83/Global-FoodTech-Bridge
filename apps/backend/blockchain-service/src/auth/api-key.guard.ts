import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const secretKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!secretKey) {
        console.error('CRITICAL: INTERNAL_API_KEY missing in environment variables');
    }

    if (apiKey && secretKey && apiKey === secretKey) {
      return true;
    }

    console.warn(`[AUTH] Invalid API Key attempt. Received len: ${apiKey?.length}, Expected configured: ${!!secretKey}`);

    throw new UnauthorizedException('Invalid or missing API Key');
  }
}
