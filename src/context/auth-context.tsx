
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

const fetchAppUser = async (uid: string): Promise<AppUser | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const data = docSnap.data() as AppUserData;
        return {
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate()
        };
    }
    return null;
}


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
        const appProfile = await fetchAppUser(user.uid);
        // This case handles a user who is authenticated with Firebase Auth
        // but doesn't have a document in Firestore yet (e.g., first Google login).
        if (appProfile) {
            setAppUser(appProfile);
        } else {
            // This is a critical fallback for first-time sign-ins.
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

    if (docSnap.exists()) { 
        const data = docSnap.data() as AppUserData;
        const existingAppUser = {
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate()
        };
        setAppUser(existingAppUser); // Ensure state is updated for existing users too
        return;
    }
    
    const newName = name || user.displayName || user.email?.split('@')[0] || 'Usuário';
    
    const newUserDocData: AppUserData = {
        uid: user.uid,
        email: user.email,
        name: newName,
        photoURL: user.photoURL,
        role: 'user', // Default role
        createdAt: serverTimestamp() as Timestamp,
    };
    
    await setDoc(userRef, newUserDocData);

    const newAppUser: AppUser = {
        uid: newUserDocData.uid,
        email: newUserDocData.email,
        name: newUserDocData.name,
        photoURL: newUserDocData.photoURL,
        role: newUserDocData.role,
        createdAt: new Date(), // Use current date as a good approximation
    };

    // Explicitly set the appUser state immediately after creation.
    // This is the key fix.
    setAppUser(newAppUser);
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
        const userCredential = await signInWithPopup(auth, provider);
        // `onAuthStateChanged` will eventually fire, but we can speed up the UI
        // by handling the new user data immediately.
        await handleNewUser(userCredential.user);
        
        toast({
            title: 'Login com Google bem-sucedido!',
            description: 'Bem-vindo(a).',
        });
    } catch (error: any) {
        let description = error.message || 'Não foi possível autenticar com o Google.';
        if (error.code === 'auth/unauthorized-domain') {
            description = 'Este domínio não está autorizado para login. Por favor, adicione-o no Console do Firebase > Authentication > Settings > Authorized domains.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            return; // Don't show a toast for this case
        }
        
        console.error("Google Sign-In Error:", error);
        toast({
            variant: 'destructive',
            title: 'Falha no Login com Google',
            description: description,
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
