
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
  getDocs,
} from 'firebase/firestore';
import type { Issue, IssueData } from '@/lib/types';

// Helper to convert Firestore doc to Issue object
const fromFirestore = (docData: any, id: string): Issue => {
  const data = docData as IssueData;
  return {
    id,
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    location: {
      lat: data.location.latitude,
      lng: data.location.longitude,
    },
    address: data.address,
    imageUrl: data.imageUrl,
    reportedAt: data.reportedAt ? (data.reportedAt as Timestamp).toDate() : new Date(),
    reporter: data.reporter,
    upvotes: data.upvotes,
  };
};

export type NewIssue = {
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number };
  address?: string;
  reporter: string;
};

export async function addIssueClient(issue: NewIssue) {
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
  const payload: Omit<IssueData, 'reportedAt'> & { reportedAt: any } = {
    title: issue.title.trim(),
    description: issue.description.trim(),
    category: issue.category || "Outros",
    status: "Recebido",
    upvotes: 0,
    reporter: issue.reporter,
    address: issue.address?.trim() || "",
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

export const updateIssueStatus = async (issueId: string, newStatus: Issue['status']) => {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, { status: newStatus });
};
