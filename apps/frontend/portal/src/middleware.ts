import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('gftb-session');
    const { pathname } = request.nextUrl;

    // Protected paths
    const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
    
    // Auth path
    const isAuthPath = pathname.startsWith('/auth/login');

    if (isProtectedPath && !sessionToken) {
        // Redirect to login if trying to access protected path without session
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (isAuthPath && sessionToken) {
        // Redirect to dashboard if already logged in and trying to access login page
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/auth/login'
    ],
};
