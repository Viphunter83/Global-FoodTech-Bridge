import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // If we have a service account key in the future, it should be added here
    // clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    try {
        admin.initializeApp(firebaseAdminConfig);
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
