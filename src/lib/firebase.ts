
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-8624979202-b4d44",
  "appId": "1:916199359133:web:2fbac66210633e196c4a74",
  "apiKey": "AIzaSyAp1CQzafcMSl1OLTJL0bH_-nj68IOl5sc",
  "authDomain": "studio-8624979202-b4d44.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "916199359133"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
