
'use client';

import { useState, useMemo, useEffect } from 'react';
import InteractiveMap from '@/components/interactive-map';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, Search, ThumbsUp, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { listenToIssues, updateIssueUpvotes } from '@/services/issue-service';
import type { Issue } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

const UPVOTED_ISSUES_KEY = 'upvotedIssues';

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [upvotedIssues, setUpvotedIssues] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [showIssues, setShowIssues] = useState(true);
  const { toast } = useToast();

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
    try {
      const storedUpvotes = localStorage.getItem(UPVOTED_ISSUES_KEY);
      if (storedUpvotes) {
        setUpvotedIssues(new Set(JSON.parse(storedUpvotes)));
      }
    } catch (error) {
      console.error('Failed to parse upvoted issues from localStorage', error);
    }
  }, []);

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


  const getStatusVariant = (status: 'Recebido' | 'Em análise' | 'Resolvido') => {
    switch (status) {
      case 'Resolvido':
        return 'default';
      case 'Em análise':
        return 'secondary';
      case 'Recebido':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleUpvote = async (issueId: string, currentUpvotes: number) => {
    if (upvotedIssues.has(issueId)) {
      return; 
    }
    
    // Optimistically update the UI
    const newUpvotedSet = new Set(upvotedIssues).add(issueId);
    setUpvotedIssues(newUpvotedSet);

    try {
      await updateIssueUpvotes(issueId, currentUpvotes + 1);
       // Persist to localStorage only on success
       localStorage.setItem(UPVOTED_ISSUES_KEY, JSON.stringify(Array.from(newUpvotedSet)));
    } catch (error) {
       // Revert the optimistic update on error
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
    <div className="h-screen w-screen flex flex-col">
      <div className="relative flex-grow">
        <InteractiveMap issues={showIssues ? filteredIssues : []} />

        <div className="absolute top-4 left-4 z-10 w-80 space-y-4 mt-20">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ocorrência..."
                  className="pl-10 bg-white"
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
                        <Layers className="h-5 w-5"/>
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

        <div className="absolute top-4 right-4 z-10 w-96 mt-20">
           <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200 max-h-[calc(100vh-8rem)] flex flex-col">
            <CardHeader>
              <CardTitle>Ocorrências Recentes</CardTitle>
              <CardDescription>Veja os problemas reportados pela comunidade.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-6">
                  {filteredIssues.length > 0 ? filteredIssues.map((issue) => (
                    <div key={issue.id} className="p-3 rounded-lg bg-white/50 border border-gray-200/80 space-y-2">
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
                        variant="outline"
                        className="w-full"
                        onClick={() => handleUpvote(issue.id, issue.upvotes)}
                        disabled={upvotedIssues.has(issue.id)}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Apoiar ({issue.upvotes})
                      </Button>
                    </div>
                  )) : (
                    <p className="text-sm text-center text-muted-foreground py-8">Nenhuma ocorrência encontrada.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
