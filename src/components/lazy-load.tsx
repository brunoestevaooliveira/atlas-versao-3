/**
 * @file src/components/lazy-load.tsx
 * @fileoverview Componente para "lazy load" de componentes filhos.
 * Utiliza a Intersection Observer API para renderizar um placeholder (esqueleto)
 * até que o componente entre na área visível da tela, momento em que
 * renderiza os componentes filhos reais. Isso melhora a performance
 * ao adiar o carregamento de componentes pesados que estão fora da tela.
 */

'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Skeleton } from './ui/skeleton';

interface LazyLoadProps {
  children: ReactNode;
  /** Altura do placeholder do esqueleto. */
  placeholderHeight?: string;
  /** Classe CSS adicional para o placeholder. */
  className?: string;
}

const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholderHeight = '180px',
  className,
}) => {
  // Controla se o componente já se tornou visível.
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Quando o componente entra na viewport, atualizamos o estado.
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          // Uma vez visível, desconectamos o observador para evitar trabalho desnecessário.
          if (placeholderRef.current) {
            observer.unobserve(placeholderRef.current);
          }
        }
      },
      {
        // A raiz da observação é a viewport, e o componente é carregado
        // 200px antes de entrar completamente na tela.
        rootMargin: '200px 0px',
      }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    // Função de limpeza para desconectar o observador ao desmontar.
    return () => {
      if (placeholderRef.current) {
        observer.unobserve(placeholderRef.current);
      }
    };
  }, []);

  // Se já estiver visível, renderiza os filhos.
  // Caso contrário, renderiza o esqueleto de placeholder.
  return isVisible ? (
    <>{children}</>
  ) : (
    <div ref={placeholderRef} className={className}>
      <Skeleton style={{ height: placeholderHeight }} className="w-full" />
    </div>
  );
};

export default LazyLoad;
