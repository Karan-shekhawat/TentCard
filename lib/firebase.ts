import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAYVgmM92fSuTpc22ZoNVn-ka6CF4wtmjE",
  authDomain: "tentcard-c8de2.firebaseapp.com",
  projectId: "tentcard-c8de2",
  storageBucket: "tentcard-c8de2.firebasestorage.app",
  messagingSenderId: "545219434464",
  appId: "1:545219434464:web:cbfc668cde8258ba73bd85"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
