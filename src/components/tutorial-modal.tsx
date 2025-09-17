
'use client';

import { useState } from 'react';
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

const tutorialSteps = [
  {
    icon: <Compass className="w-12 h-12 md:w-16 md:h-16 text-primary" />,
    title: 'Bem-vindo ao Atlas Cívico!',
    description: 'Um tour rápido para você conhecer as principais funcionalidades da plataforma e começar a colaborar com a sua cidade.',
  },
  {
    icon: <Map className="w-12 h-12 md:w-16 md:h-16 text-primary" />,
    title: 'Explore o Mapa Interativo',
    description: 'Na tela principal, você pode visualizar todas as ocorrências reportadas. Clique em um marcador para ver detalhes ou clique em qualquer lugar no mapa para iniciar um novo reporte.',
  },
  {
    icon: <FilePlus className="w-12 h-12 md:w-16 md:h-16 text-primary" />,
    title: 'Reporte uma Ocorrência',
    description: 'Encontrou um problema? Vá para a aba "Reportar", descreva a situação, adicione a localização (pelo mapa) e envie para que a administração possa analisar.',
  },
  {
    icon: <BarChart className="w-12 h-12 md:w-16 md:h-16 text-primary" />,
    title: 'Acompanhe o Andamento',
    description: 'Na aba "Acompanhar", você pode filtrar e visualizar o status de todas as ocorrências: as que foram recebidas, as que estão em análise e as que já foram resolvidas.',
  },
  {
    icon: <Check className="w-12 h-12 md:w-16 md:h-16 text-primary" />,
    title: 'Pronto para Começar!',
    description: 'Agora você já sabe o básico. Explore a plataforma e ajude a construir uma cidade melhor para todos. Sua participação faz a diferença!',
  },
];

const TUTORIAL_COMPLETED_KEY = 'tutorialCompleted';

interface TutorialModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TutorialModal({ isOpen, onOpenChange }: TutorialModalProps) {
  const handleClose = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-md w-full p-0">
        <Carousel className="w-full">
          <CarouselContent>
            {tutorialSteps.map((step, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col items-center justify-center text-center p-6 md:p-8 space-y-4 h-[420px] md:h-[400px]">
                  <div className="mb-4">{step.icon}</div>
                  <h3 className="text-xl md:text-2xl font-bold font-headline">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
             <CarouselPrevious className="static -translate-y-0"/>
             <CarouselNext className="static -translate-y-0" />
          </div>
        </Carousel>
         <DialogFooter className="p-4 border-t items-center flex-row justify-between w-full">
            <Button variant="ghost" onClick={handleClose}>Pular Tutorial</Button>
            <Button onClick={handleClose}>Concluir</Button>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
