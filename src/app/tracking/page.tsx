

'use client';

import { useState, useEffect } from 'react';
import IssueCard from '@/components/issue-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { listenToIssues, updateIssueUpvotes } from '@/services/issue-service';
import type { Issue } from '@/lib/types';
import { BarChart, CheckCircle, Hourglass, ListFilter, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const UPVOTED_ISSUES_KEY = 'upvotedIssues';

const EmptyState = ({ tabName }: { tabName: string }) => (
  <div className="text-center py-20 col-span-full">
    <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50" />
    <h3 className="mt-4 text-lg font-semibold">Nenhuma ocorrência encontrada</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      Não há ocorrências com o status "{tabName}" no momento.
    </p>
  </div>
);

export default function TrackingPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [upvotedIssues, setUpvotedIssues] = useState(new Set<string>());
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

  const receivedIssues = issues.filter(issue => issue.status === 'Recebido');
  const inProgressIssues = issues.filter(issue => issue.status === 'Em análise');
  const resolvedIssues = issues.filter(issue => issue.status === 'Resolvido');

  return (
    <div className="container mx-auto py-8 mt-20">
      <header className="space-y-2 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Acompanhar Solicitações</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Veja o andamento das ocorrências que você e outros cidadãos reportaram em tempo real.
        </p>
      </header>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mx-auto max-w-2xl">
          <TabsTrigger value="all">
            <ListFilter className="mr-2 h-4 w-4" /> Todas ({issues.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            <Hourglass className="mr-2 h-4 w-4" /> Recebidas ({receivedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress">
             <BarChart className="mr-2 h-4 w-4" /> Em Análise ({inProgressIssues.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle className="mr-2 h-4 w-4" /> Resolvidas ({resolvedIssues.length})
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-8">
          <TabsContent value="all">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {issues.length > 0 ? issues.map((issue) => (
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
              {receivedIssues.length > 0 ? receivedIssues.map((issue) => (
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
              {inProgressIssues.length > 0 ? inProgressIssues.map((issue) => (
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
              {resolvedIssues.length > 0 ? resolvedIssues.map((issue) => (
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
  );
}
