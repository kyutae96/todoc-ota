
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // TODO: Replace with your actual project ID from the Firebase console.
  "projectId": "todoc-ota",
  // TODO: Replace with your actual app ID from the Firebase console.
  "appId": "1:995016378087:web:3c702cecc5d02579cbc442",
  // TODO: Replace with your actual storage bucket from the Firebase console.
  "storageBucket": "todoc-ota.appspot.com",
  // TODO: Replace with your actual API key from tfileshe Firebase console.
  "apiKey": "AIzaSyAioH5aUo19iEWtSyqrkm21scRLkI3nhts",
  // TODO: Replace with your actual auth domain from the Firebase console.
  "authDomain": "todoc-ota.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1003104102687"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
