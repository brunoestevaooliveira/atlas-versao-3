

'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import SplashScreen from '@/components/splash-screen';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/auth-context';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = ['/login', '/register'].includes(pathname);
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [isSplashFinishing, setIsSplashFinishing] = useState(false);

  useEffect(() => {
    if (isPublicPage) {
      setIsSplashLoading(false);
      return;
    }
    const finishTimer = setTimeout(() => setIsSplashFinishing(true), 2000);
    const removeTimer = setTimeout(() => setIsSplashLoading(false), 3000);
    return () => {
      clearTimeout(finishTimer);
      clearTimeout(removeTimer);
    };
  }, [isPublicPage]);
  
  useEffect(() => {
    // This is the core logic. If loading is finished, and there's no user,
    // and we are NOT on a public page, then redirect.
    if (!isLoading && !authUser && !isPublicPage) {
      router.push('/login');
    }
    // If the user is logged in and tries to access a public page, redirect to home.
    if (!isLoading && authUser && isPublicPage) {
      router.push('/');
    }
  }, [isLoading, authUser, isPublicPage, router]);

  // While auth is loading, and we are not on a public page, show a loader.
  // This prevents the redirect logic from firing prematurely.
  if (isLoading && !isPublicPage) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>Atlas Cívico</title>
        <meta name="description" content="Plataforma cívica para mapeamento e resolução de problemas urbanos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        {isSplashLoading && !isPublicPage ? (
          <SplashScreen isFinishing={isSplashFinishing} />
        ) : (
          <>
            {!isPublicPage && <Header />}
            <main>{children}</main>
            <Toaster />
          </>
        )}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
