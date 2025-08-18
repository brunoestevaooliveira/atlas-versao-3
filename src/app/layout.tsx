
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

const publicPaths = ['/', '/register']; 

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = publicPaths.includes(pathname);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && !isPublicPath) {
      router.push('/');
    }
    
    if (isAuthenticated && isPublicPath) {
        router.push('/mapa');
    }

  }, [isAuthenticated, loading, router, pathname, isPublicPath]);

  if (loading) {
     return <SplashScreen isFinishing={false} />;
  }

  if (!isAuthenticated && !isPublicPath) {
    return <SplashScreen isFinishing={false} />;
  }
  
  if (isAuthenticated && isPublicPath) {
      return <SplashScreen isFinishing={false} />;
  }


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
  
  const pathname = usePathname();
  const noSplash = ['/', '/register'];

  useEffect(() => {
    // Only run splash screen if not on a public/auth page
    if (noSplash.includes(pathname)) {
        setIsLoading(false);
        return;
    }

    const finishTimer = setTimeout(() => {
      setIsFinishing(true);
    }, 2000); 

    const removeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

    return () => {
      clearTimeout(finishTimer);
      clearTimeout(removeTimer);
    };
  }, [pathname]);

  return (
    <html lang="pt-BR">
      <head>
        <title>Atlas Cívico</title>
        <meta name="description" content="Plataforma cívica para mapeamento e resolução de problemas urbanos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <AuthProvider>
            {isLoading ? (
                <SplashScreen isFinishing={isFinishing} />
            ) : (
                <ProtectedLayout>
                    {children}
                </ProtectedLayout>
            )}
        </AuthProvider>
      </body>
    </html>
  );
