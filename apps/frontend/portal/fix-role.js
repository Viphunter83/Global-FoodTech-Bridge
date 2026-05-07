
const admin = require('firebase-admin');

const serviceAccount = require('/Users/apple/Documents/global-foodtech-bridge-prod-firebase-adminsdk-fbsvc-70d33782fb.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'global-foodtech-bridge-prod'
    });
}

const db = admin.firestore();
const users = [
    { uid: 't7OW5sNur6cPp7S8UZtcev5bw953', role: 'MANUFACTURER', email: 'testuser@mail.com' },
    { uid: 'yHjogKKl16aYbalMhHlAltMxGhn2', role: 'ADMIN', email: 'olegvakin@gmail.com' }
];

async function run() {
    for (const user of users) {
        console.log(`Updating ${user.email} (${user.uid}) to ${user.role}...`);
        try {
            // 1. Update Firestore for UI display and extra data
            await db.collection('users').doc(user.uid).set({
                role: user.role,
                companyId: user.role === 'ADMIN' ? null : '550e8400-e29b-41d4-a716-446655440000',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 2. SET CUSTOM CLAIMS (Crucial for Proxy RBAC)
            await admin.auth().setCustomUserClaims(user.uid, { role: user.role });
            
            console.log(`SUCCESS: ${user.email} is now ${user.role} (Firestore + Custom Claims)`);
        } catch (e) {
            console.error(`FAILED for ${user.email}:`, e.message);
        }
    }
}

run();
