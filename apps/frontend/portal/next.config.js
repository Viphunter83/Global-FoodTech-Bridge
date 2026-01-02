/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/passport/:path*',
                destination: 'http://passport-service:8080/api/v1/:path*', // Docker network name
            },
            {
                source: '/api/telemetry/:path*',
                destination: 'http://iot-service:8081/api/v1/:path*',
            },
            {
                source: '/api/blockchain/:path*',
                destination: 'http://blockchain-service:3000/api/v1/:path*',
            },
        ]
    },
}

module.exports = nextConfig
