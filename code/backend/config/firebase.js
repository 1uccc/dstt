const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS) {
  // Khi chạy trên Render (hoặc môi trường production có biến môi trường)
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
  // Khi chạy trên máy local
  serviceAccount = require('./serviceAccountKey.json');
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { db, auth };