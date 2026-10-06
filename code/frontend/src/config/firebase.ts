import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBVLOC-i-MlQ96sGZcbf-7MNFqAW2HXEY0",
  authDomain: "datsanthethao-53c04.firebaseapp.com",
  projectId: "datsanthethao-53c04",
  storageBucket: "datsanthethao-53c04.firebasestorage.app",
  messagingSenderId: "31629611476",
  appId: "1:31629611476:web:2eedf3ffc41dc53c4b0641",
  measurementId: "G-NCCXG568Q6"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
