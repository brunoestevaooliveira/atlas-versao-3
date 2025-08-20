
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuração do seu app Firebase
const firebaseConfig = {
  projectId: "santa-maria-ativa",
  appId: "1:122210829117:web:81a562bd5b7bf6c16a3b54",
  storageBucket: "santa-maria-ativa.firebasestorage.app",
  apiKey: "AIzaSyD4pQe9Cq9KlEqlHKBFKaBw6ZBm9WOy1MY",
  authDomain: "santa-maria-ativa.firebaseapp.com",
  messagingSenderId: "122210829117"
};

// Inicializa Firebase de forma segura (evita reinicialização)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços para que possam ser usadas em outros lugares
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
