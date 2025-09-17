
// src/components/splash-screen.tsx
'use client';

import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  isFinishing: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFinishing }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-1000 ease-in-out',
        isFinishing ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="flex animate-pulse items-center gap-4 text-primary">
        <Compass className="h-16 w-16" />
        <h1 className="text-5xl font-bold font-headline">Atlas Cívico</h1>
      </div>
      <p className="mt-4 text-muted-foreground">
        Criado por <strong>Bruno Estevão</strong>
      </p>
    </div>
  );
};

export default SplashScreen;
