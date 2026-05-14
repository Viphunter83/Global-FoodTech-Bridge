import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    // SECURITY: Fail-fast if critical env vars are missing
    if (!process.env.INTERNAL_API_KEY) {
        logger.error('FATAL: INTERNAL_API_KEY is not set. Refusing to start without authentication configured.');
        process.exit(1);
    }

    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1');
    
    // Security: Hardened CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3005'];
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Security: Add security headers via middleware
    app.use((req: any, res: any, next: any) => {
        // Clear sensitive headers that should only be set by the auth guard
        delete req.headers['x-verified-role'];
        delete req.headers['x-verified-company-id'];

        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        next();
    });

    // Graceful Shutdown
    app.enableShutdownHooks();

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Blockchain Service is running on port ${port}`);

    // Handle termination signals
    const shutdown = async (signal: string) => {
        logger.log(`Received ${signal}. Shutting down gracefully...`);
        await app.close();
        logger.log('Blockchain Service stopped cleanly.');
        process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap();

