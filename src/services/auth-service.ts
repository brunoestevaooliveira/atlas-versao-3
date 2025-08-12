
'use client';

import {
  getAuth,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { app } from '@/lib/firebase'; // Import the initialized app
import type { AppUser } from '@/lib/types';


export const onAuthChange = (callback: (user: User | null) => void) => {
  const auth = getAuth(app);
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
    const auth = getAuth(app);
    return auth.currentUser;
}
