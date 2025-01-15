import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfzCh4VdTWRY1OdSdbQjfmzGpdmlMbI-8",
  authDomain: "sparrowmap-1a256.firebaseapp.com",
  databaseURL: "https://sparrowmap-1a256-default-rtdb.firebaseio.com",
  projectId: "sparrowmap-1a256",
  storageBucket: "sparrowmap-1a256.firebasestorage.app",
  messagingSenderId: "838155742783",
  appId: "1:838155742783:web:89f4b3ce7506cdddc7d28a",
  measurementId: "G-ZKKNMYSN1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 