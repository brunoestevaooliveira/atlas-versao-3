
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { AppUser } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  register: (email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as AppUser;
          setAppUser(userData);
          setIsAdmin(userData.role === 'admin');
        } else {
          // If user exists in Auth but not in Firestore, log them out or handle as an error state.
          await signOut(auth);
          setAppUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setAppUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    
    const role = email === 'admin@example.com' ? 'admin' : 'user';
    const name = newUser.email?.split('@')[0] || 'Usuário Anônimo';

    const newUserDoc = {
      uid: newUser.uid,
      email: newUser.email,
      name: name,
      role: role,
    };

    // Set the document in Firestore with the server timestamp
    await setDoc(doc(db, 'users', newUser.uid), {
        ...newUserDoc,
        createdAt: serverTimestamp(),
    });
    
    // Set the local appUser state without the serverTimestamp
    // The correct timestamp will be fetched on the next auth state change or reload.
    setAppUser({
        ...newUserDoc,
        createdAt: new Date(), // Use a client-side timestamp for the initial local state.
    });
  };

  const login = async (email: string, pass:string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, isAdmin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
