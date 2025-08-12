
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, signInAnonymously, type User, onAuthStateChanged } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { app } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // If no user is logged in, try to sign in anonymously
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error: any) {
           if (
            error?.code === 'auth/operation-not-allowed' ||
            error?.code === 'auth/configuration-not-found'
          ) {
            console.warn(
              'Firebase Anonymous Sign-In is not enabled. Please enable it in your Firebase console for the app to work correctly.'
            );
          } else {
             console.error('Anonymous sign-in failed:', error);
          }
        } finally {
          setLoading(false);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
       <div className="w-full h-screen flex items-center justify-center">
            <Skeleton className="w-48 h-12" />
       </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
