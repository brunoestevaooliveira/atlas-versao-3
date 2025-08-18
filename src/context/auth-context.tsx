
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
          // This case might happen if Firestore doc creation fails after auth creation.
          // Forcing a logout to ensure consistent state.
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
    
    // Determine role and name
    const role = email.toLowerCase() === 'admin@example.com' ? 'admin' : 'user';
    const name = newUser.email?.split('@')[0] || 'Usuário Anônimo';

    // Create user document in Firestore
    const userDocRef = doc(db, 'users', newUser.uid);
    await setDoc(userDocRef, {
      uid: newUser.uid,
      email: newUser.email,
      name: name,
      role: role,
      createdAt: serverTimestamp(),
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
