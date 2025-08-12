
'use client';

import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from 'firebase/auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { AppUser } from '@/lib/types';

const auth = getAuth();
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<AppUser | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore, if not, create them
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
    }

    const appUserDoc = await getDoc(userRef);
    const appUserData = appUserDoc.data();
    
    if (!appUserData) return null;

    // Convert Firestore Timestamp to Date
    const finalUser: AppUser = {
        ...appUserData,
        createdAt: appUserData.createdAt?.toDate() ?? new Date(),
    } as AppUser;

    return finalUser;

  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user.');
    } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Multiple login popups open.');
    } else {
        console.error('Error during Google login:', error);
    }
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
    return auth.currentUser;
}
