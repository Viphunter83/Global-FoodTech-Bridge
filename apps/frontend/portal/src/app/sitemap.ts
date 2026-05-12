import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gftb.app';
const locales = ['en', 'ru', 'ar', 'vi'] as const;

/**
 * Dynamic sitemap generation for all public-facing pages.
 * Excludes authenticated areas (admin, dashboard, auth).
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages = [
        '',           // Homepage
        '/contact',
        '/how-it-works',
    ];

    const entries: MetadataRoute.Sitemap = [];

    for (const page of staticPages) {
        for (const locale of locales) {
            entries.push({
                url: `${BASE_URL}/${locale}${page}`,
                lastModified: new Date(),
                changeFrequency: page === '' ? 'weekly' : 'monthly',
                priority: page === '' ? 1.0 : 0.7,
            });
        }
    }

    return entries;
}
