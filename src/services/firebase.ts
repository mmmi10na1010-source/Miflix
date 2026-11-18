import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    { experimentalAutoDetectLongPolling: true },
    databaseId
  );
} catch {
  // Fallback if Firestore was already initialized on this app instance
  dbInstance = getFirestore(app, databaseId);
}

export const db = dbInstance;
