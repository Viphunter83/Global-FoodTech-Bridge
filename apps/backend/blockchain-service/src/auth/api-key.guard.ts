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
        console.error('CRITICAL SECURITY ERROR: INTERNAL_API_KEY is not configured. Blocking all requests.');
        throw new UnauthorizedException('Service Security Configuration Missing');
    }

    if (request.method === 'GET') {
      return true;
    }

    if (apiKey === secretKey) {
      return true;
    }

    throw new UnauthorizedException('Invalid or missing API Key');
  }
}
