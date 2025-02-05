import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD_MMtaA3FvTeBGlux2Q38LcS0oR065Vzc",
  authDomain: "tc-tools.firebaseapp.com",
  projectId: "tc-tools",
  storageBucket: "tc-tools.appspot.com",
  messagingSenderId: "467099289037",
  appId: "1:467099289037:web:5f3cf41c7f72fc7e593084",
  measurementId: "G-M9R21T8WE9",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
