import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes, if we want to leave them open or handle separately? No, protect them too usually, but Vercel Cron/Webhooks might need exemption. For now, protect all.)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        '/((?!_next/static|_next/image|favicon.ico|images).*)',
    ],
};

export function middleware(req: NextRequest) {
    // 1. Check if Basic Auth is configured
    const basicAuthUser = process.env.BASIC_AUTH_USER;
    const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

    if (!basicAuthUser || !basicAuthPassword) {
        // If auth is not configured, continue without blocking
        return NextResponse.next();
    }

    // 2. Parse the "Authorization" header
    const authorizationHeader = req.headers.get('authorization');

    if (authorizationHeader) {
        // Header format: "Basic base64(user:password)"
        const authValue = authorizationHeader.split(' ')[1];
        const [user, password] = atob(authValue).split(':');

        if (user === basicAuthUser && password === basicAuthPassword) {
            // 3. Authorized!
            return NextResponse.next();
        }
    }

    // 4. Unauthorized - prompt user
    return new NextResponse('Auth Required.', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}
