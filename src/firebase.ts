import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "share-your-thoughts-861c9.firebaseapp.com",
  projectId: "share-your-thoughts-861c9",
  storageBucket: "share-your-thoughts-861c9.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = firebase.initializeApp(firebaseConfig);

export const auth = getAuth(app);
