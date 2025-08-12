// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do seu app Firebase
// Removidas chaves não utilizadas (storageBucket, messagingSenderId) para evitar
// possíveis timeouts em serviços não provisionados.
const firebaseConfig = {
  apiKey: "AIzaSyD4pQe9Cq9KlEqlHKBFKaBw6ZBm9WOy1MY",
  authDomain: "santa-maria-ativa.firebaseapp.com",
  projectId: "santa-maria-ativa",
  appId: "1:122210829117:web:666dda466c4197216a3b54"
};

// Inicializa Firebase de forma segura (evita reinicialização)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exporta a instância do Firestore para que possa ser usada em outros lugares
export const db = getFirestore(app);
