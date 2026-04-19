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

const app = isConfigValid 
    ? initializeApp(firebaseConfig) 
    : initializeApp({ apiKey: "empty", projectId: "empty", appId: "empty" });

export const auth = getAuth(app);
export const db = getFirestore(app);
