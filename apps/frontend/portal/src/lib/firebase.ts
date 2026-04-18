import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    projectId: "global-foodtech-bridge-prod",
    appId: "1:883616117431:web:8775ad9f79c4c3461b5332",
    storageBucket: "global-foodtech-bridge-prod.firebasestorage.app",
    apiKey: "AIzaSyDMPUvzJ5VUkZKkObIvJB84wNycsyH3BgU",
    authDomain: "global-foodtech-bridge-prod.firebaseapp.com",
    messagingSenderId: "883616117431",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
