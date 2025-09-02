

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
import { ThemeProvider } from '@/components/theme-provider';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { authUser, appUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = ['/login', '/register'].includes(pathname);
  const isSplashPage = !isPublicPage && !pathname.startsWith('/admin');
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
    // Não faz nada até o carregamento da autenticação terminar
    if (isLoading) return; 

    if (appUser) { // Usuário está logado
        // Se tentar acessar login/register, redireciona para a home
        if (isPublicPage) {
            router.push('/');
        }
    } else { // Usuário não está logado
        // Se tentar acessar qualquer página protegida (que não seja pública), redireciona para login
        if (!isPublicPage) {
             router.push('/login');
        }
    }
    // A proteção da rota /admin foi movida para src/app/admin/layout.tsx
  }, [isLoading, appUser, isPublicPage, router, pathname]);

   if (isLoading && !isPublicPage) {
    return (
      <body className="flex h-screen w-full items-center justify-center bg-background">
        {/* Este é um estado de carregamento global para o appUser */}
      </body>
    );
  }

  return (
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        {isSplashLoading && isSplashPage ? (
          <SplashScreen isFinishing={isSplashFinishing} />
        ) : (
          <>
            {!isPublicPage && <Header />}
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
    <html lang="pt-BR" suppressHydrationWarning>
       <head>
        <title>Atlas Cívico</title>
        <meta name="description" content="Plataforma cívica para mapeamento e resolução de problemas urbanos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
      </AuthProvider>
    </html>
  );
}
