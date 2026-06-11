import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser, verifySession } from '@/lib/auth-server';

// Role-based access map for blockchain operations
const ROLE_PERMISSIONS: Record<string, string[]> = {
    'ADMIN': ['*'],
    'MANUFACTURER': ['/notarize', '/transfer/initiate', '/violation'],
    'LOGISTICS': ['/transfer/accept', '/transfer/initiate', '/violation'],
    'RETAILER': ['/transfer/accept', '/violation'],
};

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

        // Standardize URL: ensure protocol and /api/v1
        let baseUrl = (BLOCKCHAIN_SERVICE_URL || '').trim().replace(/\/$/, '');
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        if (!baseUrl.endsWith('/api/v1')) {
            baseUrl = `${baseUrl}/api/v1`;
        }
        
        const finalUrl = `${baseUrl}${targetPath}${searchParams ? `?${searchParams}` : ''}`;
        console.log(`[GFTB-PROXY] GET ${finalUrl} [UserRole: ${userRole || 'Public'}]`);

        const headers: Record<string, string> = {
            'x-api-key': apiKey || '',
        };
        if (userRole) {
            headers['X-User-Role'] = userRole;
        }

        const response = await fetch(finalUrl, { headers });
        const contentType = response.headers.get('content-type') || '';
        let data: any;
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Blockchain Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to connect to blockchain service' }, { status: 502 });
    }
}

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    const targetPath = request.nextUrl.pathname.replace('/api/blockchain', '');
    const userRole = user.role?.toUpperCase() || 'PENDING';
    
    // 1. Strict RBAC Check
    const allowedPaths = ROLE_PERMISSIONS[userRole] || [];
    const isAllowed = allowedPaths.includes('*') || allowedPaths.some(p => targetPath.startsWith(p));

    if (!isAllowed) {
        console.warn(`[GFTB-SECURITY] Blocked unauthorized ${userRole} from accessing ${targetPath}`);
        return NextResponse.json({ 
            error: 'Access Denied', 
            message: `Your role (${userRole}) is not authorized to perform this blockchain operation.` 
        }, { status: 403 });
    }

    const BLOCKCHAIN_SERVICE_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL;
    if (!BLOCKCHAIN_SERVICE_URL) {
        return NextResponse.json({ error: 'Blockchain service URL is not configured' }, { status: 500 });
    }

    try {
        const apiKey = process.env.INTERNAL_API_KEY;

        // Standardize URL: ensure protocol and /api/v1
        let baseUrl = (BLOCKCHAIN_SERVICE_URL || '').trim().replace(/\/$/, '');
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        if (!baseUrl.endsWith('/api/v1')) {
            baseUrl = `${baseUrl}/api/v1`;
        }
        
        const finalUrl = `${baseUrl}${targetPath}`;
        console.log(`[GFTB-PROXY] POST ${finalUrl} [Role: ${userRole}] [Authorized: OK]`);

        const contentType = request.headers.get('content-type') || '';
        const headers: Record<string, string> = {
            'x-api-key': apiKey || '',
            'X-User-Role': userRole
        };
        
        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        const arrayBuffer = await request.arrayBuffer();

        const response = await fetch(finalUrl, {
            method: 'POST',
            headers,
            body: arrayBuffer,
        });

        const contentType = response.headers.get('content-type') || '';
        let data: any;
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Blockchain Proxy POST Error:', error);
        return NextResponse.json({ error: 'Failed to connect to blockchain service' }, { status: 502 });
    }
});

