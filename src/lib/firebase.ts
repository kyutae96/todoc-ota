
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "todoc-ota",
  "appId": "1:1003104102687:web:973807fd304b15c446282a",
  "storageBucket": "studio-4065495492-bfd71.firebasestorage.app",
  "apiKey": "AIzaSyC50olFk62pBKZfxVpq6ynd-o4eJudxuJc",
  "authDomain": "studio-4065495492-bfd71.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1003104102687"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
