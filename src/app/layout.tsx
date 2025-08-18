
'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/context/auth-context';
import SplashScreen from '@/components/splash-screen';


// Metadata cannot be exported from a client component.
// We can handle this in a separate file if needed.
// export const metadata: Metadata = {
//   title: 'Atlas Cívico',
//   description: 'Plataforma cívica para mapeamento e resolução de problemas urbanos.',
// };

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
            <Header />
            <main>
            {children}
            </main>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
