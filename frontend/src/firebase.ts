// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsrL297pAEH1SsHpsnLYtNpejpsbibxAQ",
  authDomain: "mealmind-47927.firebaseapp.com",
  projectId: "mealmind-47927",
  storageBucket: "mealmind-47927.firebasestorage.app",
  messagingSenderId: "1033597547642",
  appId: "1:1033597547642:web:2798b6edcf3251e5c2b7c3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);
export const auth = getAuth(app);