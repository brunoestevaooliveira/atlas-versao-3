
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

const TUTORIAL_COMPLETED_KEY = 'tutorialCompleted';

interface AuthContextType {
  authUser: User | null;
  appUser: AppUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  register: (email: string, pass: string, name: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchAppUser = async (uid: string, isAdminFromToken: boolean): Promise<AppUser | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const data = docSnap.data() as AppUserData;
        
        // Ensure the role from the token takes precedence
        const finalRole = isAdminFromToken ? 'admin' : data.role;

        return {
            ...data,
            role: finalRole,
            // Safely handle createdAt, defaulting to now if it's not a timestamp
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        };
    }
    return null;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setAuthUser(user);
        
        // Determine if it's a new user before any async operations
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

        // Check if tutorial has been completed from localStorage
        const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);

        // Show tutorial only if it's a new user AND they haven't seen it before
        if (isNewUser && tutorialCompleted !== 'true') {
            setShowTutorial(true);
        }

        const token = await user.getIdTokenResult(true);
        const isAdminStatus = token.claims.admin === true;
        setIsAdmin(isAdminStatus);

        const appProfile = await fetchAppUser(user.uid, isAdminStatus);
        if (appProfile) {
            setAppUser(appProfile);
        } else {
            // This will be called for new users (email/pass or first time Google)
            await handleNewUser(user);
        }

      } else {
        setAuthUser(null);
        setAppUser(null);
        setIsAdmin(false);
        setShowTutorial(false); // Reset on logout
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
        const existingAppUser: AppUser = {
            ...data,
            role: isAdmin ? 'admin' : data.role,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
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
    // onAuthStateChanged will then handle showing the tutorial
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
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
        throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ authUser, appUser, isLoading, isAdmin, showTutorial, setShowTutorial, register, login, loginWithGoogle, logout }}>
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
