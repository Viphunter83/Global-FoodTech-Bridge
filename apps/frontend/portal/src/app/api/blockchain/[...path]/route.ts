import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser, verifySession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const targetPath = request.nextUrl.pathname.replace('/api/blockchain', '');
    
    const BLOCKCHAIN_SERVICE_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL;
    
    if (!BLOCKCHAIN_SERVICE_URL) {
        return NextResponse.json({ error: 'Blockchain service URL is not configured' }, { status: 500 });
    }

    try {
        const apiKey = process.env.INTERNAL_API_KEY;
        const user = await verifySession(request);
        const userRole = user?.role?.toUpperCase() || '';

        // Standardize URL to include /api/v1 if not present
        let baseUrl = (BLOCKCHAIN_SERVICE_URL || '').trim().replace(/\/$/, '');
        if (!baseUrl.endsWith('/api/v1')) {
            baseUrl = `${baseUrl}/api/v1`;
        }

        const finalUrl = `${baseUrl}${targetPath}?${searchParams}`;
        console.log(`[GFTB-PROXY] GET ${finalUrl} [UserRole: ${userRole || 'Public'}] [Key: ${apiKey ? 'Present' : 'Missing'}]`);

        const headers: Record<string, string> = {
            'x-api-key': apiKey || '',
        };
        if (userRole) {
            headers['X-User-Role'] = userRole;
        }

        const response = await fetch(finalUrl, { headers });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Blockchain Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to connect to blockchain service' }, { status: 502 });
    }
}

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    const targetPath = request.nextUrl.pathname.replace('/api/blockchain', '');
    const BLOCKCHAIN_SERVICE_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL;
    
    if (!BLOCKCHAIN_SERVICE_URL) {
        return NextResponse.json({ error: 'Blockchain service URL is not configured' }, { status: 500 });
    }

    try {
        const apiKey = process.env.INTERNAL_API_KEY;
        const userRole = user.role?.toUpperCase() || '';

        // Standardize URL to include /api/v1 if not present
        let baseUrl = (BLOCKCHAIN_SERVICE_URL || '').trim().replace(/\/$/, '');
        if (!baseUrl.endsWith('/api/v1')) {
            baseUrl = `${baseUrl}/api/v1`;
        }

        const finalUrl = `${baseUrl}${targetPath}`;
        console.log(`[GFTB-PROXY] POST ${finalUrl} [Role: ${userRole}] [Key-Presence: ${!!apiKey}]`);

        const contentType = request.headers.get('content-type') || '';
        const headers: Record<string, string> = {
            'x-api-key': apiKey || '',
            'X-User-Role': userRole,
        };

        if (!apiKey) {
            console.warn(`[GFTB-PROXY] WARNING: Sending request to ${finalUrl} without INTERNAL_API_KEY`);
        }

        let body: any;

        if (contentType.includes('application/json')) {
            body = JSON.stringify(await request.json());
            // Only set Content-Type if not already present (to allow multipart/form-data for IPFS)
            const contentType = r.headers.get('content-type');
            if (contentType) {
                headers['Content-Type'] = contentType;
            } else {
                headers['Content-Type'] = 'application/json';
            }
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            body = formData;
        } else {
            body = request.body;
        }

        const response = await fetch(finalUrl, {
            method: 'POST',
            headers,
            body,
            // @ts-ignore
            duplex: 'half',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Blockchain Proxy POST Error:', error);
        return NextResponse.json({ error: 'Failed to connect to blockchain service' }, { status: 502 });
    }
});

