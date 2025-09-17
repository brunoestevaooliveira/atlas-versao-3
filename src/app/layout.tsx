
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
import TutorialModal from '@/components/tutorial-modal';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading, showTutorial, setShowTutorial } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = ['/login', '/register'].includes(pathname);
  const isSplashPage = pathname === '/';
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
    // While authentication is loading, do nothing.
    if (isLoading) {
      return; 
    }

    // If user is logged in and on a public page (login/register), redirect to home
    if (appUser && isPublicPage) {
        router.push('/');
    } 
    // If user is NOT logged in and is trying to access a protected page
    else if (!appUser && !isPublicPage) {
        router.push('/login');
    }
  }, [isLoading, appUser, pathname, router, isPublicPage]);

   // While the initial authentication check is running, show a generic loading screen
   // on protected pages to prevent a "flash" of the login page.
   if (isLoading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        {/* You can place a global spinner or skeleton here */}
      </div>
    );
  }
  
  // Show splash screen only on the root path
  if (isSplashPage && isSplashLoading) {
    return <SplashScreen isFinishing={isSplashFinishing} />;
  }

  // If the user is authenticated OR is on a public page, show the content.
  // This is the main condition to render the app.
  if (appUser || isPublicPage) {
     return (
        <>
          {!isPublicPage && <Header />}
          <main>{children}</main>
          <Toaster />
          <TutorialModal isOpen={showTutorial} onOpenChange={setShowTutorial} />
        </>
    );
  }

  // If none of the above conditions are met (e.g., not logged in and trying to access a protected route),
  // the useEffect has already initiated the redirect. Returning null prevents rendering anything
  // while the browser navigates to the login page.
  return null;
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
