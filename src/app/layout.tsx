
'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import { AuthProvider, useAuth } from '@/context/auth-context';
import SplashScreen from '@/components/splash-screen';
import { usePathname, useRouter } from 'next/navigation';


const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect on the login page itself, or if still loading
    if (loading || pathname === '/') {
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // While loading auth state, show nothing to prevent flashes of content
  if (loading && pathname !== '/') return null;
  
  // If not authenticated and not on login page, we'll be redirecting, so don't render children
  if (!isAuthenticated && pathname !== '/') return null;

  return (
    <>
      {isAuthenticated && <Header />}
      <main>{children}</main>
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    // Start fade out animation
    const finishTimer = setTimeout(() => {
      setIsFinishing(true);
    }, 2000); // Animation starts after 2 seconds

    // Remove splash screen from DOM
    const removeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Component is removed after 3 seconds (2s wait + 1s fade)

    return () => {
      clearTimeout(finishTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        <title>Atlas Cívico</title>
        <meta name="description" content="Plataforma cívica para mapeamento e resolução de problemas urbanos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        {isLoading && <SplashScreen isFinishing={isFinishing} />}
        <AuthProvider>
            <ProtectedLayout>
              {children}
            </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
