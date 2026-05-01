const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async headers() {
        return [
            {
                // Apply to all routes — required for Firebase Google Auth popup flow
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    },
                ],
            },
        ];
    },
}

module.exports = withNextIntl(nextConfig);
