
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
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setAuthUser(user);
        const token = await user.getIdTokenResult(true);
        setIsAdmin(token.claims.admin === true);

        const appProfile = await fetchAppUser(user.uid);
        if (appProfile) {
            setAppUser(appProfile);
        } else {
            await handleNewUser(user);
        }
      } else {
        setAuthUser(null);
        setAppUser(null);
        setIsAdmin(false);
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
        setAppUser(existingAppUser);
        return;
    }
    
    const newName = name || user.displayName || user.email?.split('@')[0] || 'Usuário';
    
    const newUserDocData: AppUserData = {
        uid: user.uid,
        email: user.email,
        name: newName,
        photoURL: user.photoURL,
        role: 'user', 
        createdAt: serverTimestamp() as Timestamp,
    };
    
    await setDoc(userRef, newUserDocData);

    const newAppUser: AppUser = {
        uid: newUserDocData.uid,
        email: newUserDocData.email,
        name: newUserDocData.name,
        photoURL: newUserDocData.photoURL,
        role: newUserDocData.role,
        createdAt: new Date(),
    };
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
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle the user creation and state update.
        toast({
            title: 'Login com Google bem-sucedido!',
            description: 'Bem-vindo(a).',
        });
    } catch (error: any) {
        let description = error.message || 'Não foi possível autenticar com o Google.';
        if (error.code === 'auth/unauthorized-domain') {
            description = 'Este domínio não está autorizado para login. Por favor, adicione-o no Console do Firebase > Authentication > Settings > Authorized domains.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            return; 
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
    <AuthContext.Provider value={{ authUser, appUser, isLoading, isAdmin, register, login, loginWithGoogle, logout }}>
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
