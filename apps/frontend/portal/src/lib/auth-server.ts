import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';

export interface AuthenticatedUser {
    uid: string;
    email?: string;
    role?: 'manufacturer' | 'logistics' | 'retailer' | 'admin';
}

/**
 * Verifies the Firebase ID token from the request headers.
 */
export async function verifySession(request: NextRequest): Promise<AuthenticatedUser | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        
        // Custom roles: check 'role' claim or 'admin' flag
        let role: AuthenticatedUser['role'] = 'manufacturer';
        if (decodedToken.role) {
            role = decodedToken.role as any;
        } else if (decodedToken.admin === true || decodedToken.admin === "true") {
            role = 'admin';
        }

        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role,
        };
    } catch (error) {
        console.error('Server-side auth verification failed:', error);
        return null;
    }
}

/**
 * HOF to wrap API route handlers with security checks.
 */
export function withAuth(
    handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
    requiredRole?: string
) {
    return async (req: NextRequest) => {
        const user = await verifySession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
        }

        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        return handler(req, user);
    };
}
