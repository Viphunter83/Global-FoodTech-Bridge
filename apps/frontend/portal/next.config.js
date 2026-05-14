const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    // Image optimization — allow Firebase Storage & external CDN domains
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
            { protocol: 'https', hostname: 'storage.googleapis.com' },
        ],
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Firebase Google Auth popup flow requires unsafe-none
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    },
                    // DNS prefetch for performance
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    // CSP — Report-Only mode for gradual rollout
                    // Move to enforcing after monitoring for violations
                    {
                        key: 'Content-Security-Policy-Report-Only',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseio.com https://vercel.live https://*.vercel.app",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
                            "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com https://*.tile.openstreetmap.org https://vercel.com https://*.vercel.app",
                            "font-src 'self' data: https://fonts.gstatic.com https://vercel.live https://*.vercel.app",
                            "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://polygon-rpc.com https://*.railway.app https://vercel.live https://*.vercel.app",
                            "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://vercel.live https://*.vercel.app",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
}

module.exports = withNextIntl(nextConfig);
