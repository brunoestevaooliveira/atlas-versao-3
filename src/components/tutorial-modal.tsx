/**
 * @file src/components/tutorial-modal.tsx
 * @fileoverview Modal de tutorial para novos usuários.
 * Este componente exibe um carrossel com os passos iniciais para usar a plataforma.
 * É mostrado automaticamente para novos usuários e pode ser dispensado, marcando
 * o tutorial como concluído no localStorage para não ser exibido novamente.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { Map, FilePlus, BarChart, Check, Compass } from 'lucide-react';

// Conteúdo dos slides do tutorial.
const tutorialSteps = [
  {
    icon: <Compass className="w-10 h-10 md:w-12 md:h-12 text-primary" />,
    title: 'Bem-vindo ao Atlas Cívico!',
    description: 'Um tour rápido para você conhecer as principais funcionalidades da plataforma e começar a colaborar com a sua cidade.',
    image: 'https://picsum.photos/seed/welcome/400/200',
    aiHint: 'community city',
  },
  {
    icon: <Map className="w-10 h-10 md:w-12 md:h-12 text-primary" />,
    title: 'Explore o Mapa Interativo',
    description: 'Na tela principal, visualize as ocorrências. Clique em um marcador para detalhes ou em qualquer lugar no mapa para iniciar um novo reporte.',
    image: 'https://picsum.photos/seed/map/400/200',
    aiHint: 'interactive map',
  },
  {
    icon: <FilePlus className="w-10 h-10 md:w-12 md:h-12 text-primary" />,
    title: 'Reporte uma Ocorrência',
    description: 'Encontrou um problema? Vá para a aba "Reportar", descreva a situação, adicione a localização e envie para análise.',
    image: 'https://picsum.photos/seed/form/400/200',
    aiHint: 'report form',
  },
  {
    icon: <BarChart className="w-10 h-10 md:w-12 md:h-12 text-primary" />,
    title: 'Acompanhe o Andamento',
    description: 'Na aba "Acompanhar", filtre e visualize o status de todas as ocorrências: recebidas, em análise e resolvidas.',
    image: 'https://picsum.photos/seed/tracking/400/200',
    aiHint: 'dashboard chart',
  },
  {
    icon: <Check className="w-10 h-10 md:w-12 md:h-12 text-primary" />,
    title: 'Pronto para Começar!',
    description: 'Agora você já sabe o básico. Explore a plataforma e ajude a construir uma cidade melhor. Sua participação faz a diferença!',
    image: 'https://picsum.photos/seed/ready/400/200',
    aiHint: 'city ready',
  },
];

// Chave usada para salvar o estado de conclusão do tutorial no localStorage.
const TUTORIAL_COMPLETED_KEY = 'tutorialCompleted';

interface TutorialModalProps {
  /** Controla a visibilidade do modal. */
  isOpen: boolean;
  /** Função para alterar a visibilidade do modal. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Componente do Modal de Tutorial.
 * @param {TutorialModalProps} props As propriedades do componente.
 */
export default function TutorialModal({ isOpen, onOpenChange }: TutorialModalProps) {
  
  /**
   * Fecha o modal e salva o estado de conclusão no localStorage.
   */
  const handleClose = () => {
    try {
      // Salva a informação para que o tutorial não seja mostrado novamente.
      localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    } catch (error) {
      // Falha silenciosamente se o localStorage não estiver acessível.
      console.error('Falha ao acessar o localStorage:', error);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-md w-full p-0 bg-background/80 backdrop-blur-sm border-border/50 text-foreground">
        <DialogHeader className="p-6 pb-0 sr-only">
          <DialogTitle>Tutorial Interativo</DialogTitle>
          <DialogDescription>
            Um guia rápido pelas funcionalidades da plataforma.
          </DialogDescription>
        </DialogHeader>
        <Carousel className="w-full">
          <CarouselContent>
            {tutorialSteps.map((step, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col items-center justify-center text-center p-6 md:p-8 space-y-4">
                  <div className="mb-2">{step.icon}</div>
                  <h3 className="text-xl md:text-2xl font-bold font-headline text-foreground">{step.title}</h3>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden my-2 border border-border/20">
                     <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                        data-ai-hint={step.aiHint}
                      />
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4">
             <CarouselPrevious className="static -translate-y-0 text-foreground bg-background/50 hover:bg-background/80"/>
             <CarouselNext className="static -translate-y-0 text-foreground bg-background/50 hover:bg-background/80" />
          </div>
        </Carousel>
         <DialogFooter className="p-4 border-t border-border/50 items-center flex-row justify-between w-full">
            <Button variant="ghost" onClick={handleClose}>Pular Tutorial</Button>
            <Button onClick={handleClose}>Concluir</Button>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
