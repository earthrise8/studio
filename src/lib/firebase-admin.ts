'use server';

import * as admin from 'firebase-admin';

export const initializeFirebaseAdmin = async () => {
    if (admin.apps.length > 0) {
        return;
    }

    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
        throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount)),
        });
        console.log('Firebase Admin SDK initialized.');
    } catch(e) {
        console.error('Failed to initialize Firebase Admin SDK', e);
        // This might happen during hot-reloads, so we'll try to get the existing app
        if (admin.apps.length === 0) {
             throw new Error('Firebase Admin initialization failed.');
        }
    }
};
