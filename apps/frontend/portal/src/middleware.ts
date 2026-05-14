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
    // 1. Basic Security Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // 2. Content Security Policy (CSP)
    // Using Content-Security-Policy-Report-Only for initial phase to avoid accidental breakage.
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.firebaseapp.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.googleapis.com https://*.firebasestorage.app https://images.unsplash.com;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://securetoken.google.com https://polygon-rpc.com https://*.vercel.app;
        frame-src 'self' https://*.firebaseapp.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
    
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
