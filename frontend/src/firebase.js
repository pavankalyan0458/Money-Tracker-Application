// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// The Firebase configuration details are hardcoded for direct use.
const firebaseConfig = {
  apiKey: "AIzaSyBZCGGRtxOWjqneh1m15s-w94ygjKEe2ws",
  authDomain: "money-tracker-applicatio-2f730.firebaseapp.com",
  projectId: "money-tracker-applicatio-2f730",
  storageBucket: "money-tracker-applicatio-2f730.appspot.com",
  messagingSenderId: "1058351163108",
  appId: "1:1058351163108:web:55afef75746e8131dd2ef1",
  measurementId: "G-L71BC9NZDG"
};

// Initialize Firebase with the config
const app = initializeApp(firebaseConfig);

// Export the authentication and database services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, updateProfile };
