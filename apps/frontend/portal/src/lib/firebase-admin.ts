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
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }

    console.error('[GFTB-ADMIN] CRITICAL: Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY');
    return admin.initializeApp({ projectId });
}

const app = getFirebaseAdminApp();

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
