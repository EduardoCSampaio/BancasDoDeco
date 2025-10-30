
import admin from 'firebase-admin';

let app: admin.app.App;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccount) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
}


if (!admin.apps.length) {
    app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
} else {
    app = admin.app();
}

export const getAdminApp = () => app;
export const auth = admin.auth();
