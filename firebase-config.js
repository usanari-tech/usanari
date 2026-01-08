import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyAerw6tZsL935x0cX3PR_p-JvMzNSXwfeU",
    authDomain: "goal-horizon-2026.firebaseapp.com",
    projectId: "goal-horizon-2026",
    storageBucket: "goal-horizon-2026.firebasestorage.app",
    messagingSenderId: "807997068984",
    appId: "1:807997068984:web:43bb08a2abdade5d0c064d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export {
    auth, db, provider,
    signInWithPopup, signOut, onAuthStateChanged,
    collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, setDoc, getDoc,
    serverTimestamp
};
