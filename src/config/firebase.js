// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD0ywBHZRoVG595UVWdruz88h0XeGajC_A",
  authDomain: "smart-agriculture-fff53.firebaseapp.com",
  databaseURL: "https://smart-agriculture-fff53-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-agriculture-fff53",
  storageBucket: "smart-agriculture-fff53.firebasestorage.app",
  messagingSenderId: "959834389742",
  appId: "1:959834389742:web:0ac0189df34fec1c09c7ff",
  measurementId: "G-354P9LW07M"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
