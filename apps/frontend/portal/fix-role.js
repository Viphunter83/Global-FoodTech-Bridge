
const admin = require('firebase-admin');

// Initialize with the project ID
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'global-foodtech-bridge-prod'
    });
}

const db = admin.firestore();
const uid = 't7OW5sNur6cPp7S8UZtcev5bw953';

async function run() {
    console.log('Target UID:', uid);
    try {
        await db.collection('users').doc(uid).set({
            role: 'MANUFACTURER',
            companyId: '550e8400-e29b-41d4-a716-446655440000',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('SUCCESS: User role updated to MANUFACTURER');
    } catch (e) {
        console.error('FAILED:', e.message);
    }
}

run();
