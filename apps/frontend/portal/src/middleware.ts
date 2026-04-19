import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, localePrefix } from './navigation';

const intlMiddleware = createMiddleware({
    locales,
    localePrefix,
    defaultLocale: 'en'
});

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Handle internationalization first
    const response = intlMiddleware(request);
    
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
        // Redirect to login (preserving current locale set by intlMiddleware or using default)
        const locale = pathname.split('/')[1] || 'en';
        const loginUrl = new URL(`/${locale}/auth/login`, request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthPath && sessionToken) {
        const locale = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    return response;
}

export const config = {
    // Match all paths except API, static files, and icons
    matcher: ['/((?!api|_next|.*\\..*).*)']
};

