import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCd9fkyYQ2cIZYQ9WNM2RxyvwFC7OU7r8",
  authDomain: "nagrik-seva-a0984.firebaseapp.com",
  projectId: "nagrik-seva-a0984",
  storageBucket: "nagrik-seva-a0984.firebasestorage.app",
  messagingSenderId: "333464768837",
  appId: "1:333464768837:web:82fe9c4f11fbc0ee86ae2c",
  measurementId: "G-G6489SE1JD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Provider
export const googleProvider = new GoogleAuthProvider();

// Phone Auth setup
export const setupRecaptcha = (container: string | HTMLElement) => {
  return new RecaptchaVerifier(auth, container, {
    size: 'invisible',
    callback: (response: any) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      console.log('reCAPTCHA expired');
    },
  });
};

export default app;
