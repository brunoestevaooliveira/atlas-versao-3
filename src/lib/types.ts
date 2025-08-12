
import { Timestamp, GeoPoint } from 'firebase/firestore';

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Recebido' | 'Em análise' | 'Resolvido';
  location: { lat: number; lng: number };
  imageUrl: string; // Changed back to required
  reportedAt: Date;
  reporter: string;
  upvotes: number;
};

// This is the type for data stored in Firestore
export type IssueData = {
  title: string;
  description: string;
  category: string;
  status: 'Recebido' | 'Em análise' | 'Resolvido';
  location: GeoPoint;
  imageUrl: string; // Changed back to required
  reportedAt: Timestamp;
  reporter: string;
  upvotes: number;
};

export type AppUser = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Date | Timestamp;
};
