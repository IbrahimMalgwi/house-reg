import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration from the console
const firebaseConfig = {
    apiKey: "AIzaSyAebKgT8dq2whtZnUAKaXla0-aSnVEq_Is",
    authDomain: "teen-registration.firebaseapp.com",
    projectId: "teen-registration",
    storageBucket: "teen-registration.firebasestorage.app",
    messagingSenderId: "466751004738",
    appId: "1:466751004738:web:bf745c29ca5503e426cddb",
    measurementId: "G-4NK6QXWX05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);


// Log successful initialization
console.log("Firebase initialized successfully with project: teen-registration");