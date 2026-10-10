import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedUser } from './auth-server';

export type BackendService = 'passport' | 'iot' | 'blockchain';

const SERVICE_ENV: Record<BackendService, string | undefined> = {
    passport: process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL,
    iot: process.env.NEXT_PUBLIC_IOT_SERVICE_URL,
    blockchain: process.env.NEXT_PUBLIC_BLOCKCHAIN_SERVICE_URL,
};

/** Normalizes a configured service URL to `https://host/api/v1`. */
export function serviceBaseUrl(raw: string | undefined): string | null {
    if (!raw) return null;
    let base = raw.trim().replace(/\/$/, '');
    if (!base.startsWith('http')) base = `https://${base}`;
    if (!base.endsWith('/api/v1')) base = `${base}/api/v1`;
    return base;
}

/** Returns true when `path` fully matches one of the patterns. */
export function matchesAny(path: string, patterns: RegExp[]): boolean {
    return patterns.some((p) => p.test(path));
}

interface ForwardOptions {
    service: BackendService;
    targetPath: string;
    method: 'GET' | 'POST' | 'PATCH';
    user: AuthenticatedUser | null;
    body?: BodyInit | null;
    contentType?: string | null;
    search?: string;
}

/**
 * Forwards a request to a backend service.
 *
 * The service key only proves the request comes from the portal; backends give
 * key-only requests the limited SERVICE role. The user's identity and role are
 * carried by their Firebase ID token, which the backends verify themselves.
 */
export async function forwardToBackend({ service, targetPath, method, user, body, contentType, search }: ForwardOptions) {
    const baseUrl = serviceBaseUrl(SERVICE_ENV[service]);
    if (!baseUrl) {
        return NextResponse.json({ error: `${service} service URL is not configured` }, { status: 500 });
    }

    const headers: Record<string, string> = { 'x-api-key': process.env.INTERNAL_API_KEY || '' };
    if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
    if (contentType) headers['Content-Type'] = contentType;

    const finalUrl = `${baseUrl}${targetPath}${search ? `?${search}` : ''}`;

    try {
        const response = await fetch(finalUrl, {
            method,
            headers,
            body: method === 'GET' ? undefined : body,
            cache: 'no-store',
            // @ts-ignore -- required by Node fetch when streaming a request body
            duplex: 'half',
        });

        const resContentType = response.headers.get('content-type') || '';
        const data = resContentType.includes('application/json')
            ? await response.json()
            : { message: await response.text() };
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`[GFTB-PROXY] ${method} ${service}${targetPath} failed:`, error);
        return NextResponse.json({ error: `Failed to connect to ${service} service` }, { status: 502 });
    }
}

export function notAllowed(targetPath: string) {
    console.warn(`[GFTB-PROXY] Blocked request to non-allowlisted path ${targetPath}`);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export function targetPathOf(request: NextRequest, prefix: string): string {
    return request.nextUrl.pathname.replace(prefix, '');
}
