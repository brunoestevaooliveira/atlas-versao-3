
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
  const { appUser, isLoading } = useAuth();
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
    if (isLoading) return; 

    if (appUser) {
        if (isPublicPage) {
            router.push('/');
        }
    } else { 
        if (!isPublicPage) {
             router.push('/login');
        }
    }
  }, [isLoading, appUser, isPublicPage, router, pathname]);

   if (isLoading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        {/* Placeholder for global loading state */}
      </div>
    );
  }

  return (
      <>
        {isSplashLoading && isSplashPage ? (
          <SplashScreen isFinishing={isSplashFinishing} />
        ) : (
          <>
            {!isPublicPage && <Header />}
            <main>{children}</main>
            <Toaster />
          </>
        )}
      </>
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
        <meta name="description" content="Plataforma cívica para mapeamento e resolução de problemas urbanos em Santa Maria-DF." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen font-sans antialiased')}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <LayoutContent>{children}</LayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
