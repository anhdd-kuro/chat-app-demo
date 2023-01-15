// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ6BkO1A-M-1pXWl70dVMPToK6eVHlHJ0",
  authDomain: "chat-app-demo-489e6.firebaseapp.com",
  projectId: "chat-app-demo-489e6",
  storageBucket: "chat-app-demo-489e6.appspot.com",
  messagingSenderId: "428466927276",
  appId: "1:428466927276:web:b559037408e4523a141109",
  measurementId: "G-44SBCC6GMN",
};

let analytics;
let firestore;
if (firebaseConfig?.projectId) {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  if (app.name && typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }

  // Access Firebase services using shorthand notation
  firestore = getFirestore();
}

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export { analytics, firestore };
