// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
//import { getStorage } from 'firebase/storage';

// Configuración de tu Firebase (reemplaza con tu propia configuración)
const firebaseConfig = {
    apiKey: "AIzaSyCYpN7hjqWcTm-Ft47dMXlvtDlg7HqxqaE",
    authDomain: "inkcloud-5e954.firebaseapp.com",
    projectId: "inkcloud-5e954",
    storageBucket: "inkcloud-5e954.firebasestorage.app",
    messagingSenderId: "614322332043",
    appId: "1:614322332043:web:e2e4cbcb29a5ec5842cf8e",
    databaseURL: "https://inkcloud-5e954-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancias de Auth, Firestore y Storage
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getFirestore(app);

export { auth, db, storage };
