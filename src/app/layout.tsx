
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

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { authUser, appUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = ['/login', '/register'].includes(pathname);
  const isAdminPage = pathname.startsWith('/admin');
  const isSplashPage = !isPublicPage && !isAdminPage;
  const [isSplashLoading, setIsSplashLoading] = useState(isSplashPage);
  const [isSplashFinishing, setIsSplashFinishing] = useState(false);

  useEffect(() => {
    if (!isSplashPage) {
      setIsSplashLoading(false);
      return;
    }
    const finishTimer = setTimeout(() => setIsSplashFinishing(true), 2000);
    const removeTimer = setTimeout(() => setIsSplashLoading(false), 3000);
    return () => {
      clearTimeout(finishTimer);
      clearTimeout(removeTimer);
    };
  }, [isSplashPage]);
  
  useEffect(() => {
    if (isLoading) return; // Aguarda o carregamento terminar antes de qualquer lógica

    // Redireciona usuários não autenticados para a página de login
    if (!authUser && !isPublicPage && !isAdminPage) {
      router.push('/login');
    }
    
    // Redireciona usuários autenticados para a home se tentarem acessar login/register
    if (authUser && isPublicPage) {
      router.push('/');
    }

    // Protege a rota de admin
    if (isAdminPage && appUser?.role !== 'admin') {
        router.push('/');
    }
  }, [isLoading, authUser, appUser, isPublicPage, isAdminPage, router, pathname]);

   if (isLoading && (!isPublicPage || isAdminPage)) {
    return (
      <body className="flex h-screen w-full items-center justify-center bg-background">
        <p>Verificando autenticação...</p>
      </body>
    );
  }

  return (
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        {isSplashLoading && isSplashPage ? (
          <SplashScreen isFinishing={isSplashFinishing} />
        ) : (
          <>
            {!isPublicPage && !isAdminPage && <Header />}
            <main>{children}</main>
            <Toaster />
          </>
        )}
      </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
       <head>
        <title>Atlas Cívico</title>
        <meta name="description" content="Plataforma cívica para mapeamento e resolução de problemas urbanos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </html>
  );
}
