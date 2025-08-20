

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppUser, AppUserData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  authUser: User | null;
  appUser: AppUser | null;
  isLoading: boolean;
  register: (email: string, pass: string, name: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setAuthUser(user);
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AppUserData;
          setAppUser({
              ...data,
              createdAt: (data.createdAt as Timestamp).toDate()
          });
        } else {
          // This case handles a user who is authenticated with Firebase Auth
          // but doesn't have a document in Firestore yet (e.g., first Google login).
          await handleNewUser(user);
        }
      } else {
        setAuthUser(null);
        setAppUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNewUser = async (user: User, name?: string | null) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    // If the document already exists, just load the data.
    if (docSnap.exists()) { 
        const data = docSnap.data() as AppUserData;
        setAppUser({
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate()
        });
        return;
    }
    
    // If it doesn't exist, create it.
    const newName = name || user.displayName || user.email?.split('@')[0] || 'Usuário';
    const isFirstUser = user.email === 'admin@example.com';

    const newUserDoc: AppUserData = {
        uid: user.uid,
        email: user.email,
        name: newName,
        photoURL: user.photoURL,
        role: isFirstUser ? 'admin' : 'user',
        createdAt: serverTimestamp() as Timestamp,
    };
    
    await setDoc(userRef, newUserDoc);

    // After creating, set the local state.
    setAppUser({
        uid: newUserDoc.uid,
        email: newUserDoc.email,
        name: newUserDoc.name,
        photoURL: newUserDoc.photoURL,
        role: newUserDoc.role,
        createdAt: new Date(), // Use current date for local state
    });
  }

  const register = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await handleNewUser(userCredential.user, name);
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // `onAuthStateChanged` will handle the user creation/login.
        toast({
            title: 'Login com Google bem-sucedido!',
            description: 'Bem-vindo(a).',
        });
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            return;
        }
        console.error("Google Sign-In Error:", error);
        toast({
            variant: 'destructive',
            title: 'Falha no Login com Google',
            description: error.message || 'Não foi possível autenticar com o Google.',
        });
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ authUser, appUser, isLoading, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
