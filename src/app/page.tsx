
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import InteractiveMap from '@/components/interactive-map';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, Search, ThumbsUp, MapPin, Filter, List, PanelRightOpen, PanelRightClose, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { listenToIssues, updateIssueUpvotes } from '@/services/issue-service';
import type { Issue, GeocodeResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { MapRef, MapLayerMouseEvent } from 'react-map-gl';
import { useDebounce } from 'use-debounce';
import { geocodeAddress } from '@/ai/flows/geocode-address-flow';


const UPVOTED_ISSUES_KEY = 'upvotedIssues';

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [upvotedIssues, setUpvotedIssues] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [showIssues, setShowIssues] = useState(true);
  const [isDesktopPanelOpen, setIsDesktopPanelOpen] = useState(true);
  const { toast } = useToast();
  const { appUser } = useAuth();
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);

  // Address search states
  const [addressSearch, setAddressSearch] = useState('');
  const [debouncedAddressSearch] = useDebounce(addressSearch, 500);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [noResults, setNoResults] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);


  const allCategories = useMemo(() => {
    return [...new Set(issues.map(issue => issue.category))];
  }, [issues]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    setSelectedCategories(allCategories);
  }, [allCategories]);

  useEffect(() => {
    const unsubscribe = listenToIssues(setIssues);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!appUser) return;
    try {
      const storedUpvotes = localStorage.getItem(`${UPVOTED_ISSUES_KEY}_${appUser.uid}`);
      if (storedUpvotes) {
        setUpvotedIssues(new Set(JSON.parse(storedUpvotes)));
      }
    } catch (error) {
      console.error('Failed to parse upvoted issues from localStorage', error);
    }
  }, [appUser]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const searchMatch = searchQuery.trim() === '' ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(issue.category);

      return searchMatch && categoryMatch;
    });
  }, [issues, searchQuery, selectedCategories]);


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

  const getStatusText = (status: Issue['status']) => {
    return status === 'Em análise' ? 'Análise' : status;
  };

  const handleUpvote = async (issueId: string, currentUpvotes: number) => {
    if (!appUser) {
        toast({
            variant: 'destructive',
            title: 'Acesso Negado',
            description: 'Você precisa estar logado para apoiar uma ocorrência.',
        });
        return router.push('/login');
    }

    if (upvotedIssues.has(issueId)) {
      return; 
    }
    
    const newUpvotedSet = new Set(upvotedIssues).add(issueId);
    setUpvotedIssues(newUpvotedSet);

    try {
      await updateIssueUpvotes(issueId, currentUpvotes + 1);
       localStorage.setItem(`${UPVOTED_ISSUES_KEY}_${appUser.uid}`, JSON.stringify(Array.from(newUpvotedSet)));
    } catch (error) {
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleSelectAddress = (result: GeocodeResult) => {
    const { lat, lon } = result;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 17 });
    
    // Clear results and input
    setGeocodeResults([]);
    setAddressSearch(result.display_name);

    // Simulate map click after a short delay to allow the map to fly
    setTimeout(() => {
        const map = mapRef.current?.getMap();
        if (map) {
            const mockEvent = {
                lngLat: { lng: longitude, lat: latitude },
                point: map.project([longitude, latitude]),
            } as MapLayerMouseEvent;
            
             if (mapRef.current) {
                // @ts-ignore - map.fire is a valid method
                map.fire('click', mockEvent);
            }
        }
    }, 1000); // 1-second delay
  };

  // Effect for handling geocode search with debounce
  useEffect(() => {
    if (debouncedAddressSearch.trim().length < 3) {
      setGeocodeResults([]);
      setNoResults(false);
      return;
    }

    const search = async () => {
      setIsGeocoding(true);
      setNoResults(false);
      try {
        const results = await geocodeAddress({ query: debouncedAddressSearch });
        setGeocodeResults(results);
        if (results.length === 0) {
          setNoResults(true);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        toast({
          variant: 'destructive',
          title: 'Erro ao Buscar Endereço',
          description: 'Ocorreu um problema na comunicação com o serviço de IA.',
        });
      } finally {
        setIsGeocoding(false);
      }
    };

    search();
  }, [debouncedAddressSearch, toast]);

  // Effect to close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setGeocodeResults([]);
        setNoResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


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
  

  return (
    <div className="h-screen w-screen flex flex-col pt-0 overflow-hidden">
      <div className="relative flex-grow">
        <InteractiveMap issues={showIssues ? filteredIssues : []} mapRef={mapRef}/>

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
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div ref={searchBoxRef} className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm md:max-w-md px-4">
           <Card className="rounded-lg border border-white/20 bg-white/30 dark:bg-black/30 shadow-lg backdrop-blur-xl overflow-visible">
              <CardContent className="p-2 relative">
                <div className="relative flex items-center gap-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    placeholder="Buscar por CEP ou endereço para reportar..."
                    className="bg-background/80 focus:border-primary border-0 h-10 pl-10"
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                  />
                  {isGeocoding && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                </div>
                {(geocodeResults.length > 0 || noResults) && (
                  <div className="absolute bottom-full left-0 w-full mb-2 bg-background/80 backdrop-blur-xl border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {noResults ? (
                       <p className="px-4 py-3 text-sm text-center text-muted-foreground">Nenhum resultado encontrado.</p>
                    ) : (
                      <ul>
                        {geocodeResults.map((result) => (
                          <li 
                            key={result.place_id}
                            className="px-4 py-2 text-sm text-foreground hover:bg-accent cursor-pointer border-b border-border/50 last:border-b-0"
                            onClick={() => handleSelectAddress(result)}
                          >
                            {result.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
           </Card>
        </div>


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

        {/* Desktop Panel Logic */}
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
        
        {/* Mobile Sheet Trigger */}
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
