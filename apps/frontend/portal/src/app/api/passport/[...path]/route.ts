import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser, verifySession } from '@/lib/auth-server';
import { forwardToBackend, matchesAny, notAllowed, targetPathOf } from '@/lib/backend-proxy';

const UUID = '[0-9a-fA-F-]{36}';
const BATCH_PATH = new RegExp(`^/batches/(${UUID})$`);

// Public reads; /admin/* additionally needs a session, and the backend checks the ADMIN claim
const PUBLIC_GET = [
    BATCH_PATH,
    new RegExp(`^/partners/${UUID}$`),
    /^\/templates$/,
    new RegExp(`^/templates/${UUID}$`),
];
const ADMIN_GET = [/^\/admin\/companies$/, /^\/admin\/batches$/];

const MUTATIONS: Record<'POST' | 'PATCH' | 'PUT' | 'DELETE', RegExp[]> = {
    POST: [/^\/batches$/, /^\/admin\/companies$/, /^\/admin\/templates$/],
    PATCH: [
        new RegExp(`^/batches/${UUID}/blockchain$`),
        new RegExp(`^/batches/${UUID}/sensor$`),
        new RegExp(`^/admin/companies/${UUID}/approve$`),
    ],
    PUT: [new RegExp(`^/admin/templates/${UUID}$`)],
    DELETE: [new RegExp(`^/admin/templates/${UUID}$`)],
};

export async function GET(request: NextRequest) {
    const targetPath = targetPathOf(request, '/api/passport');
    const user = await verifySession(request);

    if (matchesAny(targetPath, ADMIN_GET)) {
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: Session required for administrative access' }, { status: 401 });
        }
    } else if (!matchesAny(targetPath, PUBLIC_GET)) {
        return notAllowed(targetPath);
    }

    // Batch passports are returned decorated with blockchain history and telemetry
    const batchMatch = targetPath.match(BATCH_PATH);
    if (batchMatch) {
        const { getBatchDetails } = await import('@/lib/api');
        const decoratedBatch = await getBatchDetails(batchMatch[1], user?.token);
        if (decoratedBatch) return NextResponse.json(decoratedBatch);
    }

    return forwardToBackend({
        service: 'passport',
        targetPath,
        method: 'GET',
        user,
        search: request.nextUrl.searchParams.toString(),
    });
}

function mutation(method: keyof typeof MUTATIONS) {
    return withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
        const targetPath = targetPathOf(request, '/api/passport');
        if (!matchesAny(targetPath, MUTATIONS[method])) return notAllowed(targetPath);

        return forwardToBackend({
            service: 'passport',
            targetPath,
            // fetch accepts any method; the union type only documents what the proxy forwards
            method: method as 'POST',
            user,
            body: method === 'DELETE' ? null : await request.arrayBuffer(),
            contentType: request.headers.get('content-type'),
        });
    });
}

export const POST = mutation('POST');
export const PATCH = mutation('PATCH');
export const PUT = mutation('PUT');
export const DELETE = mutation('DELETE');
