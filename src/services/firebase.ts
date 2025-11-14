// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB56jD8D4aGqR2DAFCwzqq23ba_ck9axGw",
  authDomain: "pedidos-fotos-escuela.firebaseapp.com",
  projectId: "pedidos-fotos-escuela",
  storageBucket: "pedidos-fotos-escuela.firebasestorage.app",
  messagingSenderId: "988505321316",
  appId: "1:988505321316:web:6308379e93aad083b89471",
  measurementId: "G-6S0VDCC8J7"
};

const app = initializeApp(firebaseConfig);

// Exportá la instancia de Firestore
export const db = getFirestore(app);
