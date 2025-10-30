
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-2776215023-4252d",
  "appId": "1:149043564543:web:d210ab507cc41e608f21ca",
  "apiKey": "AIzaSyCytpy8Y8e-TX_Mom3WI9dKXwUu4MPznAg",
  "authDomain": "studio-2776215023-4252d.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "149043564543"
};


let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
