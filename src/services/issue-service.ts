"use client";

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
  GeoPoint,
  serverTimestamp,
} from 'firebase/firestore';
import type { Issue, IssueData } from '@/lib/types';

const issuesCollectionRef = collection(db, 'issues');

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

export const addIssueClient = async (issueData: {
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number };
}) => {
  await addDoc(collection(db, 'issues'), {
      ...issueData,
      reportedAt: serverTimestamp(),
      status: 'Recebido',
      upvotes: 0,
      reporter: 'Cidadão Anônimo',
      imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(issueData.title)}`,
      location: new GeoPoint(issueData.location.lat, issueData.location.lng),
  });
};


export const getIssues = async (): Promise<Issue[]> => {
  const q = query(issuesCollectionRef, orderBy('reportedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => fromFirestore(doc.data() as IssueData, doc.id));
};

export const listenToIssues = (callback: (issues: Issue[]) => void): (() => void) => {
  const q = query(issuesCollectionRef, orderBy('reportedAt', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const issues = querySnapshot.docs.map(doc => fromFirestore(doc.data(), doc.id));
    callback(issues);
  });
  return unsubscribe; // Return the unsubscribe function
};

export const updateIssueUpvotes = async (issueId: string, newUpvotes: number) => {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, { upvotes: newUpvotes });
};
