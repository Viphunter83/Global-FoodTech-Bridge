import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (request: NextRequest) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const targetPath = request.nextUrl.pathname.replace('/api/telemetry', '');
    
    const IOT_SERVICE_URL = process.env.NEXT_PUBLIC_IOT_SERVICE_URL;
    
    if (!IOT_SERVICE_URL) {
        return NextResponse.json({ error: 'IoT service URL is not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(`${IOT_SERVICE_URL}${targetPath}?${searchParams}`, {
            headers: {
                'x-api-key': process.env.INTERNAL_API_KEY || process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('IoT Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to connect to IoT service' }, { status: 502 });
    }
});

