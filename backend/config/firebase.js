const admin = require('firebase-admin');

const hasEnvCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

let credential;

if (hasEnvCredentials) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey
  });
} else if (process.env.NODE_ENV !== 'production') {
  // In development, fall back to local JSON file located at backend/config/serviceAccountKey.json
  // Correct relative path from this file
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const serviceAccount = require('./serviceAccountKey.json');
  credential = admin.credential.cert(serviceAccount);
} else {
  throw new Error(
    'Firebase Admin credentials are not set. In production, provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
  );
}

admin.initializeApp({
  credential
});

module.exports = admin;
