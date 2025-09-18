/**
 * @file src/components/splash-screen.tsx
 * @fileoverview Componente da tela de abertura (Splash Screen).
 * Exibido na primeira visita à página inicial, mostrando o logo e o nome da aplicação
 * com uma animação de pulso e um efeito de fade-out.
 */

'use client';

import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  /** `true` quando a animação de desaparecimento (fade-out) deve começar. */
  isFinishing: boolean;
}

/**
 * Componente da Splash Screen.
 * @param {SplashScreenProps} props As propriedades do componente.
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ isFinishing }) => {
  return (
    <div
      className={cn(
        // Estilos base: tela cheia, flexbox, fundo, e transição de opacidade.
        'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-1000 ease-in-out',
        // Aplica a classe 'opacity-0' quando isFinishing é true, ativando o fade-out.
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
