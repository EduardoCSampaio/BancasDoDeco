
import admin from 'firebase-admin';

// This is a server-side only file.
// It is used by server actions to interact with Firebase.

// IMPORTANT: The following environment variables must be set for this to work.
// - FIREBASE_PROJECT_ID
// - FIREBASE_CLIENT_EMAIL
// - FIREBASE_PRIVATE_KEY

export function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error('Firebase Admin environment variables are not set.');
    }
    
    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    } catch(error) {
        console.error("Firebase admin initialization error", error);
        throw new Error("Failed to initialize Firebase Admin SDK.");
    }
}
