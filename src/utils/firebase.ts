// src/utils/firebase.ts
import { initializeApp } from "firebase/app"; // Initialize Firebase with v9 modular SDK
import { getFirestore } from "firebase/firestore"; // Firestore functions
import { getStorage } from "firebase/storage"; // Storage functions
import { getAuth } from "firebase/auth"; // Auth functions

// Firebase configuration object, replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDaVvmKFAA8l50_E_Jzy13lYeC3PHy0bOE",
  authDomain: "task-management-f1352.web.app",
  projectId: "to-do-tasks-f4fa9",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore and Storage references using the modular SDK
const firestore = getFirestore(app);
const storage = getStorage(app);

// Firebase Auth (optional, if you need authentication)
const auth = getAuth(app);

export { firestore, storage, auth };
