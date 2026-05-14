import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    let idToken: string | undefined;
    try {
        const body = await request.json();
        idToken = body.idToken;

        if (!idToken) {
            console.error('[AUTH_SESSION_API] Missing idToken in request body');
            return NextResponse.json({ error: 'ID Token is required' }, { status: 400 });
        }

        console.log(`[AUTH_SESSION_API] Verifying token (length: ${idToken.length})...`);

        // 1. Verify the token on the server
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        let role = decodedToken.role || 'PENDING';

        console.log(`[AUTH_SESSION_API] Token verified for UID: ${uid}, currentRole: ${role}`);

        // 2. Self-healing: If role or companyId is missing in token, try to fetch from Firestore and sync
        if (!decodedToken.role || !decodedToken.company_id) {
            console.log(`[AUTH_SESSION_API] Missing claims for user ${uid}. Attempting sync from Firestore...`);
            const userDoc = await adminDb.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const newRole = userData?.role || role;
                const newCompanyId = userData?.companyId || decodedToken.company_id || '';
                
                if (newRole !== decodedToken.role || newCompanyId !== decodedToken.company_id) {
                    await adminAuth.setCustomUserClaims(uid, { 
                        role: newRole, 
                        company_id: newCompanyId 
                    });
                    role = newRole;
                    console.log(`[AUTH_SESSION_API] Successfully synced claims {role: '${newRole}', company_id: '${newCompanyId}'} for ${uid}`);
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
        console.error('[AUTH_SESSION_API] Authentication Error:', error.code, error.message);
        
        // Handle specific Firebase Admin errors
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Token expired', code: 'EXPIRED' }, { status: 401 });
        }
        
        return NextResponse.json({ 
            error: 'Failed to establish session', 
            message: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            debug_info: {
                hasEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
                hasKey: !!process.env.FIREBASE_PRIVATE_KEY,
                tokenLength: idToken?.length
            }
        }, { status: 401 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ status: 'success' });
    response.cookies.delete('gftb-session');
    return response;
}
