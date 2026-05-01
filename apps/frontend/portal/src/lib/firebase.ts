import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using environment variables for security.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if critical config is present to prevent SSR crashes
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Production Diagnostics (Only in development or if DEBUG=true)
const isDebug = typeof window !== 'undefined' && (window.location.search.includes('debug=true') || process.env.NODE_ENV === 'development');

if (isDebug && typeof window !== 'undefined') {
    console.log("%c [GFTB-DIAGNOSTIC] Checking Environment Variables...", "color: #16a34a; font-weight: bold;");
    
    const configCheck = {
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_PASSPORT_SERVICE_URL: process.env.NEXT_PUBLIC_PASSPORT_SERVICE_URL
    };

    Object.entries(configCheck).forEach(([key, val]) => {
        if (!val) {
            console.warn(`%c [GFTB-DIAGNOSTIC] ${key} is MISSING!`, "color: #dc2626; font-weight: bold;");
        }
    });
}

if (!isConfigValid && typeof window !== 'undefined') {
    console.error('❌ Critical: Firebase configuration is missing! Check NEXT_PUBLIC_FIREBASE_ env variables.');
}

const app = isConfigValid 
    ? initializeApp(firebaseConfig) 
    : initializeApp({ apiKey: "empty", projectId: "empty", appId: "empty" });

export const auth = getAuth(app);
export const db = getFirestore(app);
