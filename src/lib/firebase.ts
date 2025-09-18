/**
 * @file src/lib/firebase.ts
 * @fileoverview Arquivo de inicialização e configuração do Firebase.
 * Este arquivo lê as credenciais do Firebase a partir das variáveis de ambiente
 * e inicializa a aplicação Firebase. Ele exporta as instâncias dos serviços
 * essenciais (Firestore, Auth) para serem usadas em toda a aplicação.
 * O padrão `getApps().length ? getApp() : initializeApp(firebaseConfig)` é
 * uma guarda de segurança para evitar a reinicialização do Firebase em ambientes
 * de desenvolvimento com Hot Module Replacement (HMR).
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuração do seu app Firebase, lida das variáveis de ambiente.
// O prefixo NEXT_PUBLIC_ é necessário para que essas variáveis sejam
// expostas ao lado do cliente (navegador).
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
};

// Inicializa o Firebase de forma segura (evita reinicialização).
// Se já houver uma app inicializada, usa-a; senão, cria uma nova.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços para que possam ser usadas em outros lugares.
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
