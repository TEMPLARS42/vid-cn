// server/firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-private-key.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = { messaging };
