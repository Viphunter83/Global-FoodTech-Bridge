
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
            await db.collection('users').doc(user.uid).set({
                role: user.role,
                companyId: user.role === 'ADMIN' ? null : '550e8400-e29b-41d4-a716-446655440000',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`SUCCESS: ${user.email} is now ${user.role}`);
        } catch (e) {
            console.error(`FAILED for ${user.email}:`, e.message);
        }
    }
}

run();
