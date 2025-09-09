
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
  deleteDoc,
  Timestamp,
  GeoPoint,
  serverTimestamp,
  getDocs,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import type { Issue, IssueData, CommentData, AppUser, Comment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';


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
    reporterId: data.reporterId,
    upvotes: data.upvotes,
    comments: (data.comments || []).map(comment => ({
      ...comment,
      createdAt: (comment.createdAt as Timestamp).toDate(),
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  };
};

export type NewIssue = {
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number };
  address: string;
  reporter: string;
  reporterId: string;
};

export async function addIssueClient(issue: NewIssue) {
    // validação simples
  if (!issue.title?.trim()) throw new Error("Título obrigatório");
  if (!issue.description?.trim()) throw new Error("Descrição obrigatória");
  if (!issue.address?.trim()) throw new Error("Endereço obrigatório");
  if (!issue.reporterId) throw new Error("ID do relator é obrigatório");
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
    reporterId: issue.reporterId,
    address: issue.address.trim(),
    imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(issue.title)}`,
    reportedAt: serverTimestamp(),
    location: new GeoPoint(issue.location.lat, issue.location.lng),
    comments: [], // Initialize with empty comments array
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

export const deleteIssue = async (issueId: string) => {
  const issueRef = doc(db, 'issues', issueId);
  await deleteDoc(issueRef);
};

export const addCommentToIssue = async (
    issueId: string, 
    comment: { content: string },
    user: AppUser
) => {
    if (!comment.content?.trim()) throw new Error("O comentário não pode estar vazio.");
    if (!user) throw new Error("Usuário não autenticado.");

    const issueRef = doc(db, 'issues', issueId);
    
    const newComment: CommentData = {
        id: uuidv4(),
        content: comment.content.trim(),
        author: user.name || 'Usuário Anônimo',
        authorId: user.uid,
        authorPhotoURL: user.photoURL || null,
        authorRole: user.role,
        createdAt: Timestamp.now()
    };

    await updateDoc(issueRef, {
        comments: arrayUnion(newComment)
    });
};

export const deleteCommentFromIssue = async (issueId: string, commentId: string) => {
  const issueRef = doc(db, 'issues', issueId);
  const issueSnap = await getDoc(issueRef);
  if (!issueSnap.exists()) {
    throw new Error('Ocorrência não encontrada.');
  }
  
  const issueData = issueSnap.data() as IssueData;
  const updatedComments = issueData.comments.filter((c: CommentData) => c.id !== commentId);

  await updateDoc(issueRef, {
    comments: updatedComments
  });
};
