import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (request: NextRequest) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const targetPath = request.nextUrl.pathname.replace('/api/passport', '');
    
    const PASSPORT_SERVICE_URL = process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL;
    
    if (!PASSPORT_SERVICE_URL) {
        return NextResponse.json({ error: 'Passport service URL is not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(`${PASSPORT_SERVICE_URL}${targetPath}?${searchParams}`, {
            headers: {
                'x-api-key': process.env.INTERNAL_API_KEY || process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Passport Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to connect to passport service' }, { status: 502 });
    }
});

async function handleMutation(request: NextRequest, method: 'POST' | 'PATCH') {
    const targetPath = request.nextUrl.pathname.replace('/api/passport', '');
    const PASSPORT_SERVICE_URL = process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL;
    
    if (!PASSPORT_SERVICE_URL) {
        return NextResponse.json({ error: 'Passport service URL is not configured' }, { status: 500 });
    }

    try {
        const contentType = request.headers.get('content-type') || '';
        const headers: Record<string, string> = {
            'x-api-key': process.env.INTERNAL_API_KEY || process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '',
        };

        let body: any;

        if (contentType.includes('application/json')) {
            body = JSON.stringify(await request.json());
            headers['Content-Type'] = 'application/json';
        } else if (contentType.includes('multipart/form-data')) {
            body = await request.formData();
        } else {
            body = request.body;
        }

        const response = await fetch(`${PASSPORT_SERVICE_URL}${targetPath}`, {
            method,
            headers,
            body,
            // @ts-ignore
            duplex: 'half',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Passport Proxy ${method} Error:`, error);
        return NextResponse.json({ error: 'Failed to connect to passport service' }, { status: 502 });
    }
}

export const POST = withAuth(async (request: NextRequest) => {
    return handleMutation(request, 'POST');
});

export const PATCH = withAuth(async (request: NextRequest) => {
    return handleMutation(request, 'PATCH');
});

