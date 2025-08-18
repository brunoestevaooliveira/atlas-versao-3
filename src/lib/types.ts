
import { Timestamp, GeoPoint } from 'firebase/firestore';

export type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
};

export type CommentData = {
  id: string;
  author: string;
  content: string;
  createdAt: Timestamp;
}

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Recebido' | 'Em análise' | 'Resolvido';
  location: { lat: number; lng: number };
  address: string; // Endereço textual obrigatório
  imageUrl: string; 
  reportedAt: Date;
  reporter: string;
  upvotes: number;
  comments: Comment[];
};

// This is the type for data stored in Firestore
export type IssueData = {
  title: string;
  description: string;
  category: string;
  status: 'Recebido' | 'Em análise' | 'Resolvido';
  location: GeoPoint;
  address: string; // Endereço textual obrigatório
  imageUrl: string;
  reportedAt: Timestamp;
  reporter: string;
  upvotes: number;
  comments: CommentData[];
};

export type AppUser = {
    uid: string;
    email: string | null;
    name: string | null;
    createdAt: Timestamp;
    role: 'user' | 'admin';
};
