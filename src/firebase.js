import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "teen-registration.firebaseapp.com",
    projectId: "teen-registration",
    storageBucket: "teen-registration.appspot.com",
    messagingSenderId: "466751004738",
    appId: "1:466751004738:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);



