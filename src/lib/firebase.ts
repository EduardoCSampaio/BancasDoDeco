import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCytpy8Y8e-TX_Mom3WI9dKXwUu4MPznAg",
  authDomain: "studio-2776215023-4252d.firebaseapp.com",
  projectId: "studio-2776215023-4252d",
  storageBucket: "studio-2776215023-4252d.appspot.com",
  messagingSenderId: "149043564543",
  appId: "1:149043564543:web:d210ab507cc41e608f21ca"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
