// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDe17DfJOnuz6Yo0NTGz_E7jt77bI-V4LQ",
  authDomain: "homepagfe.firebaseapp.com",
  projectId: "homepagfe",
  storageBucket: "homepagfe.firebasestorage.app",
  messagingSenderId: "561104175168",
  appId: "1:561104175168:web:7127a3c60be173bfc1dfa5",
  measurementId: "G-EYLKNWQLYK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { db, analytics };

