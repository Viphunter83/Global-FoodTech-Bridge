const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        const ensureUrl = (url, fallback) => {
            if (!url) return fallback;
            let fullUrl = url.startsWith('http') ? url : `https://${url}`;
            // Ensure no trailing slash to avoid double slashes when checking suffixes
            fullUrl = fullUrl.replace(/\/$/, "");

            if (!fullUrl.endsWith('/api/v1')) {
                fullUrl = `${fullUrl}/api/v1`;
            }
            return fullUrl;
        };

        const PASSPORT_URL = ensureUrl(process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL, 'https://chic-playfulness-production-d0d6.up.railway.app');
        const IOT_URL = ensureUrl(process.env.NEXT_PUBLIC_IOT_SERVICE_URL, 'https://celebrated-consideration-production.up.railway.app');
        const BLOCKCHAIN_URL = ensureUrl(process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL, 'https://global-foodtech-bridge-production.up.railway.app');

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

module.exports = withNextIntl(nextConfig);
