/**
 * @file src/lib/firebase.ts
 * @fileoverview Arquivo de inicialização e configuração do Firebase.
 * Este arquivo lê as credenciais do Firebase a partir das variáveis de ambiente
 * e inicializa a aplicação Firebase. Ele exporta as instâncias dos serviços
 * essenciais (Firestore, Auth) para serem usadas em toda a aplicação.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuração do seu app Firebase, lida das variáveis de ambiente.
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
};

// Inicializa o Firebase de forma segura (evita reinicialização).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Inicializa os serviços
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
