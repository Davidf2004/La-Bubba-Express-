import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnX1HJrF1dahRx4l34IarRzB14kS7UE3s",
  authDomain: "la-bubba-express.firebaseapp.com",
  projectId: "la-bubba-express",
  storageBucket: "la-bubba-express.firebasestorage.app",
  messagingSenderId: "542522534465",
  appId: "1:542522534465:web:1b21ae0e1fa2c9089c74c0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);