import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    constructor(private configService: ConfigService) {}

    @Get()
    async check() {
        const checks: Record<string, string> = {};

        // Check Polygon RPC
        try {
            const rpcUrl = this.configService.get<string>('POLYGON_RPC_URL');
            if (rpcUrl) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const response = await fetch(rpcUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                checks['polygon_rpc'] = response.ok ? 'ok' : 'degraded';
            } else {
                checks['polygon_rpc'] = 'not_configured';
            }
        } catch (err) {
            checks['polygon_rpc'] = 'unreachable';
            this.logger.warn(`Health check: Polygon RPC unreachable: ${err}`);
        }

        // Overall status
        const allOk = Object.values(checks).every(v => v === 'ok' || v === 'not_configured');

        return {
            status: allOk ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            service: 'blockchain-service',
            checks,
        };
    }
}

