import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { adminAuth } from './firebase-admin';

/**
 * Server-side gate for admin pages. Middleware only checks that a session cookie
 * exists, so every admin server component must verify the token and the ADMIN
 * claim itself before fetching data. Returns the user's ID token so backend
 * calls run with the admin's identity rather than the service key alone.
 */
export const requireAdmin = cache(async (): Promise<{ uid: string; token: string }> => {
    const token = cookies().get('gftb-session')?.value;
    const decoded = token ? await adminAuth.verifyIdToken(token).catch(() => null) : null;

    if (!token || !decoded || String(decoded.role ?? '').toUpperCase() !== 'ADMIN') {
        notFound();
    }
    return { uid: decoded.uid, token };
});
