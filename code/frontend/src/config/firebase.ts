import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBVLOC-i-MlQ96sGZcbf-7MNFqAW2HXEY0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'datsanthethao-53c04.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'datsanthethao-53c04',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'datsanthethao-53c04.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '31629611476',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:31629611476:web:2eedf3ffc41dc53c4b0641',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-NCCXG568Q6'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
