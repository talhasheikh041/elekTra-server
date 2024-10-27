import admin from 'firebase-admin'

const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')

admin.initializeApp({
   credential: admin.credential.cert(serviceAccountKey),
})

console.log("Firebase Admin Initialized");

export const messaging = admin.messaging()
