import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, localePrefix } from './navigation';

const intlMiddleware = createMiddleware({
    locales,
    localePrefix,
    defaultLocale: 'en'
});

/**
 * Applies production security headers to a response object.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    return response;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Handle internationalization first
    const response = intlMiddleware(request);
    
    // If intlMiddleware is performing a redirect, return it immediately
    if (response.status >= 300 && response.status < 400) {
        return applySecurityHeaders(response as NextResponse);
    }
    
    // 2. Session verification logic
    const sessionToken = request.cookies.get('gftb-session');

    // Helper to check if a path (including locale) starts with certain strings
    const matchesPath = (path: string, target: string) => {
        const regex = new RegExp(`^/([a-z]{2}/)?${target.replace(/^\//, '')}`);
        return regex.test(path);
    };

    const isProtectedPath = matchesPath(pathname, '/dashboard') || matchesPath(pathname, '/admin');
    const isAuthPath = matchesPath(pathname, '/auth/login');

    if (isProtectedPath && !sessionToken) {
        const locale = pathname.split('/')[1] || 'en';
        const loginUrl = new URL(`/${locale}/auth/login`, request.url);
        return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (isAuthPath && sessionToken) {
        const locale = pathname.split('/')[1] || 'en';
        return applySecurityHeaders(NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url)));
    }

    return applySecurityHeaders(response as NextResponse);
}

export const config = {
    // Match all paths except API, static files, and icons
    matcher: ['/((?!api|_next|.*\\..*).*)'
]
};
