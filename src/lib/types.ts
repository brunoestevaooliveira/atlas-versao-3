/**
 * @file src/lib/types.ts
 * @fileoverview Este arquivo centraliza todas as definições de tipos (TypeScript)
 * utilizadas na aplicação. Definir os tipos em um único local ajuda a manter
 * a consistência dos dados e facilita a manutenção.
 */

import { Timestamp, GeoPoint } from 'firebase/firestore';

/**
 * Representa um comentário como usado no frontend.
 * Note que `createdAt` é um objeto `Date` para facilitar a manipulação.
 */
export type Comment = {
  id: string;
  author: string;
  authorId: string;
  authorPhotoURL?: string | null;
  authorRole: 'admin' | 'user';
  content: string;
  createdAt: Date;
};

/**
 * Representa os dados de um comentário como são armazenados no Firestore.
 * Note que `createdAt` é um `Timestamp` do Firestore.
 */
export type CommentData = {
  id: string;
  author: string;
  authorId: string;
  authorPhotoURL?: string | null;
  authorRole: 'admin' | 'user';
  content: string;
  createdAt: Timestamp;
}

/**
 * Representa uma ocorrência como usada no frontend.
 * `reportedAt` é um `Date` e `location` é um objeto com `lat` e `lng`.
 */
export type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Recebido' | 'Em análise' | 'Resolvido';
  location: { lat: number; lng: number };
  address: string;
  imageUrl: string; 
  reportedAt: Date;
  reporter: string;
  reporterId: string;
  upvotes: number;
  comments: Comment[];
};

/**
 * Representa os dados de uma ocorrência como são armazenados no Firestore.
 * `reportedAt` é um `Timestamp` e `location` é um `GeoPoint`.
 */
export type IssueData = {
  title: string;
  description: string;
  category: string;
  status: 'Recebido' | 'Em análise' | 'Resolvido';
  location: GeoPoint;
  address: string;
  imageUrl: string;
  reportedAt: Timestamp;
  reporter: string;
  reporterId: string;
  upvotes: number;
  comments: CommentData[];
};

/**
 * Representa o perfil de um usuário como usado no frontend.
 * `createdAt` é um objeto `Date`.
 */
export type AppUser = {
    uid: string;
    email: string | null;
    name: string | null;
    photoURL?: string | null;
    createdAt: Date;
    role: 'user' | 'admin';
    issuesReported: number;
};

/**
 * Representa os dados de um perfil de usuário como são armazenados no Firestore.
 * `createdAt` é um `Timestamp`.
 */
export type AppUserData = {
    uid: string;
    email: string | null;
    name: string | null;
    photoURL?: string | null;
    createdAt: Timestamp;
    role: 'user' | 'admin';
    issuesReported: number;
}

/**
 * Representa o resultado de uma busca na API de geocodificação.
 * (Atualmente não utilizada após a troca para Mapbox, mas mantida para referência).
 */
export interface GeocodeResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}
