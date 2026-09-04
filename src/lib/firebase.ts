import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDQ3LU73I-nv0Mghm6mZOpCxOhLkDS03RM",
  authDomain: "kathavahini-9a9c1.firebaseapp.com",
  projectId: "kathavahini-9a9c1",
  storageBucket: "kathavahini-9a9c1.firebasestorage.app",
  messagingSenderId: "63748712545",
  appId: "1:63748712545:web:df61a333ccc86acac2e220",
  measurementId: "G-BT55GMSKLQ"
};

// Initialize Firebase App instance safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Configure realistic timeouts (20 seconds for upload retry, 15 seconds for operations)
// This prevents infinite 10-minute retry hangs when network drops or bucket is uninitialized
storage.maxUploadRetryTime = 20000;
storage.maxOperationRetryTime = 15000;

