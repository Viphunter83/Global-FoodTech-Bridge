import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser, verifySession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const targetPath = request.nextUrl.pathname.replace('/api/passport', '');
    
    const PASSPORT_SERVICE_URL = process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL;
    
    if (!PASSPORT_SERVICE_URL) {
        return NextResponse.json({ error: 'Passport service URL is not configured' }, { status: 500 });
    }

    try {
        const apiKey = process.env.INTERNAL_API_KEY;
        const isAdminPath = targetPath.startsWith('/admin/');
        
        let userRole = '';
        if (isAdminPath) {
            const user = await verifySession(request);
            if (!user) {
                return NextResponse.json({ error: 'Unauthorized: Session required for administrative access' }, { status: 401 });
            }
            userRole = user.role?.toUpperCase() || '';
        } else {
            // Optional: still try to get role for analytics/audit if session exists
            const user = await verifySession(request);
            if (user) userRole = user.role?.toUpperCase() || '';
        }

        // Standardize URL to include /api/v1 if not present
        let baseUrl = PASSPORT_SERVICE_URL.replace(/\/$/, '');
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
        console.error('Passport Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to connect to passport service' }, { status: 502 });
    }
}

async function handleMutation(request: NextRequest, method: 'POST' | 'PATCH', user: AuthenticatedUser) {
    const targetPath = request.nextUrl.pathname.replace('/api/passport', '');
    const PASSPORT_SERVICE_URL = process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL;
    
    if (!PASSPORT_SERVICE_URL) {
        return NextResponse.json({ error: 'Passport service URL is not configured' }, { status: 500 });
    }

    try {
        const apiKey = process.env.INTERNAL_API_KEY;
        const userRole = user.role?.toUpperCase() || '';
        
        if (!apiKey) {
            console.error(`[GFTB-PROXY] CRITICAL: INTERNAL_API_KEY missing for ${method} request.`);
        }

        // Standardize URL to include /api/v1 if not present
        let baseUrl = PASSPORT_SERVICE_URL.replace(/\/$/, '');
        if (!baseUrl.endsWith('/api/v1')) {
            baseUrl = `${baseUrl}/api/v1`;
        }

        const finalUrl = `${baseUrl}${targetPath}`;
        console.log(`[GFTB-PROXY] ${method} ${finalUrl} [Role: ${userRole}] [Key: ${apiKey ? 'Present' : 'Missing'}]`);

        const contentType = request.headers.get('content-type') || '';
        const headers: Record<string, string> = {
            'x-api-key': apiKey || '',
            'X-User-Role': userRole,
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

        const response = await fetch(finalUrl, {
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

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    return handleMutation(request, 'POST', user);
});

export const PATCH = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    return handleMutation(request, 'PATCH', user);
});

