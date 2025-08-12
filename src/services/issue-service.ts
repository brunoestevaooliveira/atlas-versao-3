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
} from 'firebase/firestore';
import type { Issue, IssueData } from '@/lib/types';

const issuesCollectionRef = collection(db, 'issues');

// Helper to convert Firestore doc to Issue object
const fromFirestore = (docData: IssueData, id: string): Issue => {
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
    reportedAt: docData.reportedAt.toDate(),
    reporter: docData.reporter,
    upvotes: docData.upvotes,
  };
};

export const addIssue = async (issue: Omit<Issue, 'id'>) => {
  const issueData: IssueData = {
    ...issue,
    reportedAt: Timestamp.fromDate(issue.reportedAt),
    location: new GeoPoint(issue.location.lat, issue.location.lng),
  };
  await addDoc(issuesCollectionRef, issueData);
};

export const getIssues = async (): Promise<Issue[]> => {
  const q = query(issuesCollectionRef, orderBy('reportedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => fromFirestore(doc.data() as IssueData, doc.id));
};

export const listenToIssues = (callback: (issues: Issue[]) => void): (() => void) => {
  const q = query(issuesCollectionRef, orderBy('reportedAt', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const issues = querySnapshot.docs.map(doc => fromFirestore(doc.data() as IssueData, doc.id));
    callback(issues);
  });
  return unsubscribe; // Return the unsubscribe function
};

export const updateIssueUpvotes = async (issueId: string, newUpvotes: number) => {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, { upvotes: newUpvotes });
};
