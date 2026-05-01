import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'ID Token is required' }, { status: 400 });
        }

        // 1. Verify the token on the server
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        let role = decodedToken.role || 'PENDING';

        // 2. Self-healing: If role is missing in token, try to fetch from Firestore and sync
        if (!decodedToken.role) {
            console.log(`[AUTH_SESSION_API] Role missing for user ${uid}. Attempting sync from Firestore...`);
            const userDoc = await adminDb.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData?.role) {
                    role = userData.role;
                    await adminAuth.setCustomUserClaims(uid, { role });
                    console.log(`[AUTH_SESSION_API] Successfully synced role '${role}' to custom claims for ${uid}`);
                }
            }
        }

        // 3. Set as a secure HttpOnly cookie
        const response = NextResponse.json({ 
            status: 'success',
            uid,
            role
        });

        response.cookies.set('gftb-session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('[AUTH_SESSION_API] Error:', error);
        return NextResponse.json({ error: 'Failed to establish session', message: error.message }, { status: 401 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ status: 'success' });
    response.cookies.delete('gftb-session');
    return response;
}
