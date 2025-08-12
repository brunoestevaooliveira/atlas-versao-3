// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do seu app Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD4pQe9Cq9KlEqlHKBFKaBw6ZBm9WOy1MY",
  authDomain: "santa-maria-ativa.firebaseapp.com",
  projectId: "santa-maria-ativa",
  storageBucket: "santa-maria-ativa.firebasestorage.app",
  messagingSenderId: "122210829117",
  appId: "1:122210829117:web:666dda466c4197216a3b54"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância do Firestore para que possa ser usada em outros lugares
export const db = getFirestore(app);
