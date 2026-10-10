import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser, verifySession } from '@/lib/auth-server';
import { forwardToBackend, matchesAny, notAllowed, targetPathOf } from '@/lib/backend-proxy';

// Role-based access map for blockchain operations (exact paths after /api/blockchain).
// The backend enforces the same roles from the forwarded token; this is the first line.
const ROLE_PERMISSIONS: Record<string, string[]> = {
    ADMIN: ['*'],
    MANUFACTURER: ['/ipfs/upload', '/blockchain/notarize', '/blockchain/transfer/initiate'],
    LOGISTICS: ['/blockchain/transfer/accept', '/blockchain/transfer/initiate', '/blockchain/violation'],
    RETAILER: ['/blockchain/transfer/accept', '/blockchain/violation'],
};

const ID = '[A-Za-z0-9-]{1,64}';
const PUBLIC_GET = [new RegExp(`^/blockchain/status/${ID}$`), new RegExp(`^/blockchain/history/${ID}$`)];
const ADMIN_GET = [/^\/blockchain\/admin\/status$/];

export async function GET(request: NextRequest) {
    const targetPath = targetPathOf(request, '/api/blockchain');
    const user = await verifySession(request);

    if (matchesAny(targetPath, ADMIN_GET)) {
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else if (!matchesAny(targetPath, PUBLIC_GET)) {
        return notAllowed(targetPath);
    }

    return forwardToBackend({
        service: 'blockchain',
        targetPath,
        method: 'GET',
        user,
        search: request.nextUrl.searchParams.toString(),
    });
}

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    const targetPath = targetPathOf(request, '/api/blockchain');
    const userRole = user.role?.toUpperCase() || 'PENDING';

    const allowedPaths = ROLE_PERMISSIONS[userRole] || [];
    if (!allowedPaths.includes('*') && !allowedPaths.includes(targetPath)) {
        console.warn(`[GFTB-SECURITY] Blocked ${userRole} from ${targetPath}`);
        return NextResponse.json({
            error: 'Access Denied',
            message: `Your role (${userRole}) is not authorized to perform this blockchain operation.`,
        }, { status: 403 });
    }

    return forwardToBackend({
        service: 'blockchain',
        targetPath,
        method: 'POST',
        user,
        body: await request.arrayBuffer(),
        contentType: request.headers.get('content-type'),
    });
});
