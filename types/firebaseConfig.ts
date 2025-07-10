// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyAXVEelFc5QNVWhHqPTr7Jpji2KUg4dnVI",
  authDomain: "uberapp-1efdf.firebaseapp.com",
  databaseURL: "https://uberapp-1efdf-default-rtdb.firebaseio.com",
  projectId: "uberapp-1efdf",
  storageBucket: "uberapp-1efdf.appspot.com",
  messagingSenderId: "256031525835",
  appId: "1:256031525835:web:5b8b4a2e9f61d317d3044e"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);

// Export Realtime Database
export const db = getDatabase(app);
