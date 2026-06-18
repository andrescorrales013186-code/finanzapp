import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRxdiC7VJcVj3kYQqkuXjsvxSd9qqCE-o",
  authDomain: "finanzapp-prod.firebaseapp.com",
  projectId: "finanzapp-prod",
  storageBucket: "finanzapp-prod.firebasestorage.app",
  messagingSenderId: "609632975608",
  appId: "1:609632975608:web:a59dd0267ae0d860d1990d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
