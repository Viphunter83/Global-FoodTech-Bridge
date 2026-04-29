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
        };
        
        if (userRole) {
            headers['X-User-Role'] = userRole;
        }

        let requestBody: any = null;
        
        if (contentType.includes('multipart/form-data')) {
            requestBody = await request.formData();
            // Do NOT set Content-Type header here, fetch will automatically set it 
            // with the correct boundary when passing a FormData object.
        } else {
            if (contentType) {
                headers['Content-Type'] = contentType;
            }
            // For JSON or other requests, just pass as text
            const textBody = await request.text();
            if (textBody) {
                requestBody = textBody;
            }
        }

        const fetchOptions: RequestInit = {
            method: 'POST',
            headers,
        };
        
        if (requestBody) {
            fetchOptions.body = requestBody;
        }

        const response = await fetch(finalUrl, fetchOptions);

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Blockchain Proxy POST Error:', error);
        console.error(error.stack);
        return NextResponse.json({ error: 'Failed to connect to blockchain service', message: error.message }, { status: 502 });
    }
});

