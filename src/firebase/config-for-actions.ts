
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This is a server-side only file.
// It is used by server actions to interact with Firebase.
// IMPORTANT: This uses the Admin SDK and requires environment variables to be set.

function initializeAdminApp() {
    if (getApps().some(app => app.name === 'admin')) {
        return getApp('admin');
    }

    // Check if the required environment variables are set.
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        // In a development environment or a non-Vercel environment, you might not have these.
        // This is a fallback to prevent crashing the server during local dev if keys aren't set.
        // However, actions requiring DB access will fail.
        console.warn("Firebase Admin environment variables are not set. Admin SDK calls will fail.");
        
        // A mock app/db could be returned here for local dev without a DB,
        // but for now we'll let it fail on use.
        // A simple config to allow server to start, but db operations will fail.
         try {
            return initializeApp({
                projectId: 'bancasdodeco'
            }, 'admin');
        } catch (e) {
            // If even this fails, return the default app if it exists
             if (getApps().length) return getApp();
             throw new Error("Could not initialize Firebase Admin App. Environment variables missing.");
        }
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    }, 'admin');
}

const adminApp = initializeAdminApp();
export const db = getFirestore(adminApp);
