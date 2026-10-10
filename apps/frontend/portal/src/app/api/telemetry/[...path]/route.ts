import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth-server';
import { forwardToBackend, matchesAny, notAllowed, targetPathOf } from '@/lib/backend-proxy';

const UUID = '[0-9a-fA-F-]{36}';

// Public read-only telemetry for batch passports
const GET_ALLOWLIST = [
    new RegExp(`^/telemetry/${UUID}$`),
    new RegExp(`^/telemetry/${UUID}/alerts$`),
];

export async function GET(request: NextRequest) {
    const targetPath = targetPathOf(request, '/api/telemetry');
    if (!matchesAny(targetPath, GET_ALLOWLIST)) return notAllowed(targetPath);

    return forwardToBackend({
        service: 'iot',
        targetPath,
        method: 'GET',
        user: await verifySession(request),
        search: request.nextUrl.searchParams.toString(),
    });
}
