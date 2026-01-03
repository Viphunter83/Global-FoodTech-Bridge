/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        const PASSPORT_URL = process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL || 'http://passport-service:8080/api/v1';
        const IOT_URL = process.env.NEXT_PUBLIC_IOT_SERVICE_URL || 'http://iot-service:8081/api/v1';
        const BLOCKCHAIN_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL || 'http://blockchain-service:3000/api/v1';

        return [
            {
                source: '/api/passport/:path*',
                destination: `${PASSPORT_URL}/:path*`,
            },
            {
                source: '/api/telemetry/:path*',
                destination: `${IOT_URL}/:path*`,
            },
            {
                source: '/api/blockchain/:path*',
                destination: `${BLOCKCHAIN_URL}/:path*`,
            },
        ]
    },
}

module.exports = nextConfig
