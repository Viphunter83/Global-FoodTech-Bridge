import * as admin from 'firebase-admin';

function getFirebaseAdminApp() {
    if (admin.apps.length) {
        return admin.apps[0]!;
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Strip quotes and fix newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (privateKey) {
        // Remove surrounding quotes if they exist
        privateKey = privateKey.trim().replace(/^["']|["']$/g, '');
        // Handle escaped newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (clientEmail && privateKey) {
        try {
            console.log(`[GFTB-ADMIN] Initializing with ProjectID: ${projectId}, Email: ${clientEmail}, KeyLength: ${privateKey.length}`);
            
            // Validate private key format roughly
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                console.error('[GFTB-ADMIN] WARNING: Private key does not contain expected header.');
            }

            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } catch (initError) {
            console.error('[GFTB-ADMIN] FAILED to initialize with certificate:', initError);
            // Fall through to fallback
        }
    }

    if (projectId) {
        console.warn('[GFTB-ADMIN] Falling back to default initialization with ProjectID only.');
        return admin.initializeApp({ projectId });
    }

    console.error('[GFTB-ADMIN] CRITICAL: Missing all Firebase credentials (ProjectID, Email, Key).');
    
    // During build, we might not have any of these. Return a dummy app if we can,
    // or at least don't crash the whole process yet.
    // admin.initializeApp() without args will throw, so we return a dummy or just let it throw if it must.
    return admin.initializeApp({ projectId: 'gftb-build-placeholder' });
}

const app = getFirebaseAdminApp();

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
