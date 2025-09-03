
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import InteractiveMap from '@/components/interactive-map';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, Search, ThumbsUp, MapPin, Filter, ChevronDown } from 'lucide-react';
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

const UPVOTED_ISSUES_KEY = 'upvotedIssues';

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [upvotedIssues, setUpvotedIssues] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [showIssues, setShowIssues] = useState(true);
  const { toast } = useToast();
  const { appUser } = useAuth();
  const router = useRouter();


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
        issue.category.toLowerCase().includes(searchQuery.toLowerCase());
      
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
  

  return (
    <div className="h-screen w-screen flex flex-col pt-24 overflow-hidden">
      <div className="relative flex-grow">
        <InteractiveMap issues={showIssues ? filteredIssues : []} />

        <div className="absolute top-4 left-4 z-10 w-80 space-y-4">
          <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ocorrência..."
                  className="pl-10"
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
                        <Layers className="h-5 w-5 text-brand"/>
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

        <div className="absolute top-4 right-4 z-10 w-96 max-h-[calc(100vh-8rem)]">
           <Card className="h-full flex flex-col overflow-y-auto shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ocorrências Recentes</CardTitle>
              <CardDescription>Veja os problemas reportados pela comunidade.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
                <div className="space-y-4">
                  {filteredIssues.length > 0 ? filteredIssues.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()).map((issue) => (
                    <div key={issue.id} className="p-3 rounded-lg border space-y-2 bg-background/50">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{issue.title}</h4>
                        <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.category}</p>
                      {issue.address && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3"/>
                            <span>{issue.address}</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full border"
                        onClick={() => handleUpvote(issue.id, issue.upvotes)}
                        disabled={upvotedIssues.has(issue.id)}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4 text-brand" />
                        Apoiar ({issue.upvotes})
                      </Button>
                    </div>
                  )) : (
                    <p className="text-sm text-center text-muted-foreground py-8">Nenhuma ocorrência encontrada.</p>
                  )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
