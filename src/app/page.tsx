/**
 * @file src/app/page.tsx
 * @fileoverview Componente principal da página do mapa interativo.
 * Este componente renderiza o mapa, os controles de busca e filtro,
 * e o painel de ocorrências recentes. A importação do mapa é feita
 * dinamicamente para garantir que ele só seja renderizado no lado do cliente.
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, Search, ThumbsUp, MapPin, Filter, List, PanelRightOpen, PanelRightClose, ExternalLink, Globe, Map as MapIcon, Square, Cuboid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { listenToIssues, updateIssueUpvotes } from '@/services/issue-service';
import type { Issue } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { MapRef } from 'react-map-gl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Chave usada para armazenar no localStorage os IDs das ocorrências que o usuário já apoiou.
const UPVOTED_ISSUES_KEY = 'upvotedIssues';

// Importação dinâmica do mapa para desativar a renderização no lado do servidor (SSR).
const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});


/**
 * Componente da página principal que exibe o mapa interativo e a lista de ocorrências.
 */
export default function MapPage() {
  // --- ESTADOS (States) ---

  // Armazena a lista completa de ocorrências recebidas do Firestore.
  const [issues, setIssues] = useState<Issue[]>([]);
  // Armazena um conjunto de IDs das ocorrências que o usuário logado já apoiou.
  const [upvotedIssues, setUpvotedIssues] = useState(new Set<string>());
  // Armazena o texto digitado pelo usuário na barra de busca.
  const [searchQuery, setSearchQuery] = useState('');
  // Controla a visibilidade dos marcadores de ocorrências no mapa.
  const [showIssues, setShowIssues] = useState(true);
  // Controla a visibilidade do painel lateral de ocorrências em telas de desktop.
  const [isDesktopPanelOpen, setIsDesktopPanelOpen] = useState(true);
  // Controla o estilo do mapa (ruas ou satélite).
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  // Referência para o componente do mapa, usada para controlar programaticamente a câmera (zoom, pitch, etc.).
  const mapRef = useRef<MapRef>(null);

  // --- HOOKS ---
  const { toast } = useToast();
  const { appUser } = useAuth();
  const router = useRouter();


  // --- MEMOS (useMemo) ---

  // Extrai e armazena uma lista de categorias únicas de todas as ocorrências.
  // É recalculado apenas quando a lista de 'issues' muda.
  const allCategories = useMemo(() => {
    return [...new Set(issues.map(issue => issue.category))];
  }, [issues]);

  // Estado que armazena as categorias selecionadas pelo usuário no filtro.
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Efeito que inicializa as categorias selecionadas com todas as categorias disponíveis quando o app carrega.
  useEffect(() => {
    if (allCategories.length > 0) {
      setSelectedCategories(allCategories);
    }
  }, [allCategories]);


  // Filtra e retorna a lista de ocorrências com base na busca e nos filtros de categoria.
  // É recalculado apenas quando as dependências (issues, searchQuery, selectedCategories) mudam.
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Verifica se o texto de busca corresponde a algum campo da ocorrência.
      const searchMatch = searchQuery.trim() === '' ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Verifica se a categoria da ocorrência está na lista de categorias selecionadas.
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(issue.category);

      return searchMatch && categoryMatch;
    });
  }, [issues, searchQuery, selectedCategories]);


  // --- EFEITOS (useEffect) ---

  // Efeito que se inscreve para ouvir as atualizações de ocorrências do Firestore em tempo real.
  // A função de 'cleanup' (retorno) cancela a inscrição para evitar memory leaks.
  useEffect(() => {
    const unsubscribe = listenToIssues(setIssues);
    return () => unsubscribe();
  }, []);

  // Efeito que carrega os IDs das ocorrências apoiadas pelo usuário do localStorage quando o appUser é definido.
  useEffect(() => {
    if (!appUser) return;
    try {
      const storedUpvotes = localStorage.getItem(`${UPVOTED_ISSUES_KEY}_${appUser.uid}`);
      if (storedUpvotes) {
        setUpvotedIssues(new Set(JSON.parse(storedUpvotes)));
      }
    } catch (error) {
      console.error('Falha ao analisar os apoios do localStorage', error);
    }
  }, [appUser]);

  
  // --- FUNÇÕES AUXILIARES ---

  /**
   * Retorna a variante de cor para o Badge de status.
   * @param status O status atual da ocorrência.
   * @returns A variante de cor ('info', 'warning', 'success').
   */
  const getStatusVariant = (status: 'Recebido' | 'Em análise' | 'Resolvido'): "info" | "warning" | "success" => {
    switch (status) {
      case 'Resolvido':
        return 'success';
      case 'Em análise':
        return 'warning';
      case 'Recebido':
        return 'info';
      default:
        return 'info';
    }
  };

  /**
   * Retorna o texto formatado para o status (ex: 'Em análise' -> 'Análise').
   * @param status O status da ocorrência.
   */
  const getStatusText = (status: Issue['status']) => {
    return status === 'Em análise' ? 'Análise' : status;
  };

  /**
   * Manipula a lógica de apoio (upvote) a uma ocorrência.
   * Verifica se o usuário está logado e se já não apoiou a ocorrência.
   * Atualiza o estado local e o localStorage, e então envia a atualização para o Firestore.
   * @param issueId ID da ocorrência a ser apoiada.
   * @param currentUpvotes Número atual de apoios.
   */
  const handleUpvote = async (issueId: string, currentUpvotes: number) => {
    if (!appUser) {
        toast({
            variant: 'destructive',
            title: 'Acesso Negado',
            description: 'Você precisa estar logado para apoiar uma ocorrência.',
        });
        return router.push('/login');
    }

    // Impede apoios múltiplos.
    if (upvotedIssues.has(issueId)) {
      return; 
    }
    
    // Atualização otimista da UI
    const newUpvotedSet = new Set(upvotedIssues).add(issueId);
    setUpvotedIssues(newUpvotedSet);

    try {
      // Atualiza o Firestore e o localStorage em caso de sucesso.
      await updateIssueUpvotes(issueId, currentUpvotes + 1);
       localStorage.setItem(`${UPVOTED_ISSUES_KEY}_${appUser.uid}`, JSON.stringify(Array.from(newUpvotedSet)));
    } catch (error) {
       // Reverte a UI em caso de erro.
       const revertedUpvotedSet = new Set(upvotedIssues);
       revertedUpvotedSet.delete(issueId);
       setUpvotedIssues(revertedUpvotedSet);

       toast({
        variant: 'destructive',
        title: 'Erro ao apoiar',
        description: 'Não foi possível registrar seu apoio. Tente novamente.',
      });
    }
  };

  /**
   * Manipula a mudança de seleção de uma categoria no filtro.
   * Adiciona ou remove a categoria da lista de categorias selecionadas.
   * @param category A categoria que foi clicada.
   */
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  /**
   * Usa a API do mapa para animar a câmera para uma visão 3D (isométrica).
   */
  const set3DView = () => {
    mapRef.current?.flyTo({ pitch: 60, bearing: -20, duration: 1500 });
  };
  
  /**
   * Usa a API do mapa para animar a câmera para uma visão 2D (de cima).
   */
  const set2DView = () => {
    mapRef.current?.flyTo({ pitch: 0, bearing: 0, duration: 1500 });
  };


  /**
   * Componente que renderiza a lista de ocorrências recentes.
   * É separado para ser reutilizado no painel de desktop e na gaveta móvel.
   */
  const RecentIssuesPanelContent = () => (
      <div className="space-y-4">
        {filteredIssues.length > 0 ? filteredIssues.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()).map((issue) => {
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${issue.location.lat},${issue.location.lng}`;
          return (
            <div key={issue.id} className="p-4 rounded-lg border border-border/50 space-y-3 bg-background/50 hover:border-primary/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-lg text-foreground">{issue.title}</h4>
                  <p className="text-sm text-primary font-semibold">{issue.category}</p>
                </div>
                <Badge variant={getStatusVariant(issue.status)}>{getStatusText(issue.status)}</Badge>
              </div>
              
              {issue.address && (
                <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-primary"/>
                      <span className="text-slate-400 truncate">{issue.address}</span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-8 flex-shrink-0">
                       <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver no Google Maps
                       </Link>
                    </Button>
                </div>
              )}

              <Button
                size="sm"
                variant="ghost"
                className={cn(
                    "w-full bg-transparent hover:bg-white/10 dark:hover:bg-black/10 border border-border/20 text-foreground",
                    upvotedIssues.has(issue.id) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handleUpvote(issue.id, issue.upvotes)}
                disabled={upvotedIssues.has(issue.id)}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Apoiar ({issue.upvotes})
              </Button>
            </div>
          );
        }) : (
          <p className="text-sm text-center text-muted-foreground py-8">Nenhuma ocorrência encontrada.</p>
        )}
      </div>
  );
  

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <div className="h-screen w-screen flex flex-col pt-0 overflow-hidden">
      <div className="relative flex-grow">
        {/* O mapa interativo ocupa todo o espaço disponível. */}
        <InteractiveMap issues={showIssues ? filteredIssues : []} mapStyle={mapStyle} ref={mapRef}/>

        {/* Painel de Controle (apenas Desktop) */}
        <div className="absolute top-24 left-4 z-10 hidden md:block w-80 space-y-4">
          <Card className="rounded-lg border border-white/20 bg-white/30 dark:bg-black/30 shadow-lg backdrop-blur-xl">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ocorrência..."
                  className="pl-10 bg-background/80 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Switch 
                    id="layers-switch" 
                    checked={showIssues}
                    onCheckedChange={setShowIssues}
                    />
                    <Label htmlFor="layers-switch">Mostrar Ocorrências</Label>
                </div>
                <div className="flex items-center">
                    <TooltipProvider>
                       <Tooltip>
                        <TooltipTrigger asChild>
                          {/* Botão para alternar entre mapa de ruas e satélite */}
                          <Button variant="ghost" size="icon" onClick={() => setMapStyle(style => style === 'streets' ? 'satellite' : 'streets')}>
                              {mapStyle === 'streets' ? <Globe className="h-5 w-5 text-primary"/> : <MapIcon className="h-5 w-5 text-primary"/>}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Mudar para vista {mapStyle === 'streets' ? 'Satélite' : 'Ruas'}</p>
                        </TooltipContent>
                      </Tooltip>
                      {/* Popover para filtrar por categorias */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                              <Layers className="h-5 w-5 text-primary"/>
                              <span className="sr-only">Filtrar Camadas</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                  <Filter className="h-4 w-4"/>
                                  <h4 className="font-medium text-sm">Filtrar por Categoria</h4>
                              </div>
                              <div className="space-y-2">
                              {allCategories.map(category => (
                                  <div key={category} className="flex items-center space-x-2">
                                      <Checkbox
                                          id={category}
                                          checked={selectedCategories.includes(category)}
                                          onCheckedChange={() => handleCategoryChange(category)}
                                      />
                                      <Label htmlFor={category} className="text-sm font-normal">
                                          {category}
                                      </Label>
                                  </div>
                              ))}
                              </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Separator orientation="vertical" className="h-6 mx-1" />
                      {/* Botões de controle da câmera 2D/3D */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={set2DView}>
                              <Square className="h-5 w-5 text-primary"/>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visão de Cima (2D)</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={set3DView}>
                              <Cuboid className="h-5 w-5 text-primary"/>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visão 3D</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card de instrução para reportar, posicionado na parte inferior central */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm md:max-w-md px-4">
          <Card className="rounded-lg border border-white/20 bg-white/30 dark:bg-black/30 shadow-lg backdrop-blur-xl">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full">
                  <MapPin className="h-5 w-5" />
                </div>
                <p className="text-sm md:text-base text-foreground">
                  Clique no mapa para selecionar um local e criar uma ocorrência.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel lateral de ocorrências recentes (Desktop) */}
        <div className="absolute top-24 right-4 z-10 max-h-[calc(100vh-8rem)] hidden md:block">
          {!isDesktopPanelOpen && (
            <Button size="icon" className="rounded-full shadow-lg" onClick={() => setIsDesktopPanelOpen(true)}>
              <PanelRightClose />
              <span className="sr-only">Abrir painel de ocorrências</span>
            </Button>
          )}
          <div className={cn(
              "transition-all duration-300 ease-in-out",
              isDesktopPanelOpen ? "w-96 opacity-100" : "w-0 opacity-0",
              "overflow-hidden"
            )}>
            <Card className="h-full flex flex-col rounded-lg border border-white/20 bg-white/30 dark:bg-black/30 shadow-lg backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-foreground font-headline">Ocorrências Recentes</CardTitle>
                  <CardDescription className="text-muted-foreground">Veja os problemas reportados.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsDesktopPanelOpen(false)}>
                  <PanelRightOpen />
                  <span className="sr-only">Fechar painel</span>
                </Button>
              </CardHeader>
              <CardContent className="flex-grow p-6 pt-0 overflow-y-auto">
                <RecentIssuesPanelContent />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Gatilho para abrir la gaveta de ocorrências (Mobile) */}
         <div className="absolute top-24 right-4 z-10 md:hidden">
           <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="rounded-full shadow-lg">
                    <List className="h-5 w-5"/>
                    <span className="sr-only">Ver ocorrências</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[75vh] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Ocorrências Recentes</SheetTitle>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto pr-6">
                  <RecentIssuesPanelContent />
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
