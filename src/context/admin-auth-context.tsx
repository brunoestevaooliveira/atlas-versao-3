
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppUser, AppUserData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';

interface AdminAuthContextType {
  appUser: AppUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const mainAuth = useAuth();

  useEffect(() => {
    // If the main auth is loading, we are also loading.
    setIsLoading(mainAuth.isLoading);
    if (!mainAuth.isLoading) {
      if (mainAuth.appUser && mainAuth.appUser.role === 'admin') {
        setAppUser(mainAuth.appUser);
      } else {
        setAppUser(null);
      }
    }
  }, [mainAuth.isLoading, mainAuth.appUser]);

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const userData = docSnap.data() as AppUserData;
        if (userData.role === 'admin') {
            setAppUser({ ...userData, createdAt: userData.createdAt.toDate() });
            toast({ title: 'Login de Admin bem-sucedido!' });
            router.push('/admin');
        } else {
            await signOut(auth); // Sign out non-admin users
            throw new Error('Acesso negado. Esta conta não é de administrador.');
        }
    } else {
        await signOut(auth); // Sign out if no user doc found
        throw new Error('Conta de administrador não encontrada.');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
    router.push('/admin/login');
  };

  // If we are on an admin page, provide the context.
  if (pathname.startsWith('/admin')) {
      return (
        <AdminAuthContext.Provider value={{ appUser, isLoading, login, logout }}>
          {children}
        </AdminAuthContext.Provider>
      );
  }

  // Otherwise, just render children without the provider.
  return <>{children}</>;
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider on an admin page');
  }
  return context;
};
