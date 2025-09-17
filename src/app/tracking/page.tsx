
'use client';

import { useState, useEffect, useMemo } from 'react';
import IssueCard from '@/components/issue-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { listenToIssues, updateIssueUpvotes } from '@/services/issue-service';
import type { Issue } from '@/lib/types';
import { BarChart, CheckCircle, Hourglass, ListFilter, Inbox, Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const UPVOTED_ISSUES_KEY = 'upvotedIssues';

const EmptyState = ({ tabName }: { tabName: string }) => (
  <div className="text-center py-20 col-span-full">
    <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50" />
    <h3 className="mt-4 text-lg font-semibold">Nenhuma ocorrência encontrada</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      Não há ocorrências com o status "{tabName}" que correspondam aos seus filtros.
    </p>
  </div>
);

export default function TrackingPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [upvotedIssues, setUpvotedIssues] = useState(new Set<string>());
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [myIssuesOnly, setMyIssuesOnly] = useState(false);
  const { toast } = useToast();
  const { appUser } = useAuth();
  const router = useRouter();

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

  const uniqueCategories = useMemo(() => {
    return ['all', ...new Set(issues.map(issue => issue.category))];
  }, [issues]);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues;

    // 1. Filter by my issues
    if (myIssuesOnly && appUser) {
        filtered = filtered.filter(issue => issue.reporterId === appUser.uid);
    }

    // 2. Filter by status (from tabs)
    if (activeTab !== 'all') {
      const statusMap = {
        received: 'Recebido',
        inProgress: 'Em análise',
        resolved: 'Resolvido',
      };
      // @ts-ignore
      filtered = filtered.filter(issue => issue.status === statusMap[activeTab]);
    }
    
    // 3. Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // 4. Filter by address
    if (addressFilter.trim() !== '') {
      filtered = filtered.filter(issue => 
        issue.address.toLowerCase().includes(addressFilter.toLowerCase())
      );
    }

    // 5. Sort
    if (sortOrder === 'upvotes') {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      filtered.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
    }

    return filtered;
  }, [issues, activeTab, categoryFilter, addressFilter, sortOrder, myIssuesOnly, appUser]);


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

  const getIssuesForTab = (status?: 'Recebido' | 'Em análise' | 'Resolvido') => {
      if (!status) return filteredAndSortedIssues;
      return filteredAndSortedIssues.filter(issue => issue.status === status);
  }

  const allTabIssues = getIssuesForTab();
  const receivedTabIssues = getIssuesForTab('Recebido');
  const inProgressTabIssues = getIssuesForTab('Em análise');
  const resolvedTabIssues = getIssuesForTab('Resolvido');
  

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto py-8 pt-24">
        <header className="space-y-2 text-center mb-8">
          <h1 className="text-4xl font-bold font-headline">Acompanhar Ocorrências</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore, filtre e veja o andamento das ocorrências reportadas em tempo real.
          </p>
        </header>

        <Card className="mb-8 p-4 bg-card/80">
          <CardContent className="flex flex-col sm:flex-row gap-4 p-2 items-center">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="Buscar por endereço..." 
                  className="pl-10"
                  value={addressFilter}
                  onChange={(e) => setAddressFilter(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="flex-1 w-full sm:w-auto">
                <SelectValue placeholder="Filtrar por Categoria" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Todas as Categorias' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="flex-1 w-full sm:w-auto">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="upvotes">Mais Apoiados (Prioridade)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch 
                  id="my-issues-only" 
                  checked={myIssuesOnly}
                  onCheckedChange={setMyIssuesOnly}
                  disabled={!appUser}
              />
              <Label htmlFor="my-issues-only" className="whitespace-nowrap">Minhas Ocorrências</Label>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mx-auto max-w-2xl">
            <TabsTrigger value="all">
              <ListFilter className="mr-2 h-4 w-4" /> Todas ({allTabIssues.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              <Hourglass className="mr-2 h-4 w-4" /> Recebidas ({receivedTabIssues.length})
            </TabsTrigger>
            <TabsTrigger value="inProgress">
              <BarChart className="mr-2 h-4 w-4" /> Em Análise ({inProgressTabIssues.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              <CheckCircle className="mr-2 h-4 w-4" /> Resolvidas ({resolvedTabIssues.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="all">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allTabIssues.length > 0 ? allTabIssues.map((issue) => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    onUpvote={() => handleUpvote(issue.id, issue.upvotes)}
                    isUpvoted={upvotedIssues.has(issue.id)}
                  />
                )) : <EmptyState tabName="Todas" />}
              </div>
            </TabsContent>
            <TabsContent value="received">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {receivedTabIssues.length > 0 ? receivedTabIssues.map((issue) => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    onUpvote={() => handleUpvote(issue.id, issue.upvotes)}
                    isUpvoted={upvotedIssues.has(issue.id)}
                  />
                )) : <EmptyState tabName="Recebidas" />}
              </div>
            </TabsContent>
            <TabsContent value="inProgress">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgressTabIssues.length > 0 ? inProgressTabIssues.map((issue) => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    onUpvote={() => handleUpvote(issue.id, issue.upvotes)}
                    isUpvoted={upvotedIssues.has(issue.id)}
                  />
                )) : <EmptyState tabName="Em Análise" />}
              </div>
            </TabsContent>
            <TabsContent value="resolved">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resolvedTabIssues.length > 0 ? resolvedTabIssues.map((issue) => (
                  <IssueCard 
                      key={issue.id} 
                      issue={issue} 
                      onUpvote={() => handleUpvote(issue.id, issue.upvotes)}
                      isUpvoted={upvotedIssues.has(issue.id)}
                    />
                )) : <EmptyState tabName="Resolvidas" />}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
