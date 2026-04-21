import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/auth-server';

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const targetPath = request.nextUrl.pathname.replace('/api/telemetry', '');
    
    const IOT_SERVICE_URL = process.env.NEXT_PUBLIC_IOT_SERVICE_URL;
    
    if (!IOT_SERVICE_URL) {
        return NextResponse.json({ error: 'IoT service URL is not configured' }, { status: 500 });
    }

    try {
        const apiKey = process.env.INTERNAL_API_KEY || process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
        const userRole = user.role?.toUpperCase() || '';

        // Standardize URL to include /api/v1 if not present
        let baseUrl = IOT_SERVICE_URL.replace(/\/$/, '');
        if (!baseUrl.endsWith('/api/v1')) {
            baseUrl = `${baseUrl}/api/v1`;
        }

        const finalUrl = `${baseUrl}${targetPath}?${searchParams}`;
        console.log(`[GFTB-PROXY] GET ${finalUrl} [Role: ${userRole}]`);

        const response = await fetch(finalUrl, {
            headers: {
                'x-api-key': apiKey || '',
                'X-User-Role': userRole,
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('IoT Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to connect to IoT service' }, { status: 502 });
    }
});

