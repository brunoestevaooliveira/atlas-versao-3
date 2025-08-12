
// src/services/issue-service.ts
"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
  GeoPoint,
  serverTimestamp,
  setLogLevel,
  getDocs,
} from 'firebase/firestore';
import type { Issue, IssueData } from '@/lib/types';


setLogLevel("debug"); // log detalhado no console do navegador

// Helper to convert Firestore doc to Issue object
const fromFirestore = (docData: any, id: string): Issue => {
  return {
    id,
    title: docData.title,
    description: docData.description,
    category: docData.category,
    status: docData.status,
    location: {
      lat: docData.location.latitude,
      lng: docData.location.longitude,
    },
    imageUrl: docData.imageUrl,
    // Firestore Timestamps can be null if serverTimestamp is used and the data is not yet on the server.
    // We provide a fallback to the current date.
    reportedAt: docData.reportedAt ? docData.reportedAt.toDate() : new Date(),
    reporter: docData.reporter,
    upvotes: docData.upvotes,
  };
};

export type NewIssue = {
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number };
};

export async function addIssueClient(issue: {
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number };
}) {
    // validação simples
  if (!issue.title?.trim()) throw new Error("Título obrigatório");
  if (!issue.description?.trim()) throw new Error("Descrição obrigatória");
  if (
    typeof issue.location?.lat !== "number" ||
    typeof issue.location?.lng !== "number" ||
    Number.isNaN(issue.location.lat) ||
    Number.isNaN(issue.location.lng)
  ) {
    throw new Error("Localização inválida");
  }

  const ref = collection(db, "issues");
  const payload = {
    title: issue.title.trim(),
    description: issue.description.trim(),
    category: issue.category || "Outros",
    status: "Recebido",
    upvotes: 0,
    reporter: 'Cidadão Anônimo',
    imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(issue.title)}`,
    reportedAt: serverTimestamp(),
    location: new GeoPoint(issue.location.lat, issue.location.lng),
  };

  const docRef = await addDoc(ref, payload);
  return docRef.id;
}


export const getIssues = async (): Promise<Issue[]> => {
  const q = query(collection(db, 'issues'), orderBy('reportedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => fromFirestore(doc.data() as IssueData, doc.id));
};

export const listenToIssues = (callback: (issues: Issue[]) => void): (() => void) => {
  const q = query(collection(db, 'issues'), orderBy('reportedAt', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const issues = querySnapshot.docs.map(doc => fromFirestore(doc.data(), doc.id));
    callback(issues);
  }, (error) => {
    console.error("Firestore listen error:", error);
    // Optionally, inform the user that real-time updates have failed.
  });
  return unsubscribe; // Return the unsubscribe function
};

export const updateIssueUpvotes = async (issueId: string, newUpvotes: number) => {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, { upvotes: newUpvotes });
};
