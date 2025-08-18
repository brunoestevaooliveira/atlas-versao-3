
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
import { User } from 'firebase/auth';

const publicPaths = ['/']; // a página de login é publica

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/register');
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

  // Enquanto carrega, mostra splash ou nada para evitar piscar de conteúdo
  if (loading) {
     return <SplashScreen isFinishing={false} />;
  }

  // Se não estiver autenticado e não for página pública, redireciona, então não renderiza
  if (!isAuthenticated && !isPublicPath) {
    return <SplashScreen isFinishing={false} />;
  }
  
  // Se estiver autenticado e for página pública, redireciona, então não renderiza
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

  useEffect(() => {
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
  }, []);
  
  const pathname = usePathname();
  const noSplash = ['/', '/register'];

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
        <AuthProvider>
            {isLoading && !noSplash.includes(pathname) ? (
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
}
