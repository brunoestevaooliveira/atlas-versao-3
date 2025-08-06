import IssueCard from '@/components/issue-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { issues } from '@/lib/data';
import type { Issue } from '@/lib/types';
import { BarChart, CheckCircle, Hourglass } from 'lucide-react';

export default function TrackingPage() {
  const allIssues: Issue[] = issues;
  const receivedIssues = allIssues.filter(issue => issue.status === 'Recebido');
  const inProgressIssues = allIssues.filter(issue => issue.status === 'Em análise');
  const resolvedIssues = allIssues.filter(issue => issue.status === 'Resolvido');

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold font-headline">Acompanhar Solicitações</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Veja o andamento das ocorrências que você e outros cidadãos reportaram.
        </p>
      </header>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mx-auto max-w-2xl">
          <TabsTrigger value="all">
            <BarChart className="mr-2 h-4 w-4" /> Todas ({allIssues.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            <Hourglass className="mr-2 h-4 w-4" /> Recebidas ({receivedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress">
             <Hourglass className="mr-2 h-4 w-4" /> Em Análise ({inProgressIssues.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle className="mr-2 h-4 w-4" /> Resolvidas ({resolvedIssues.length})
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="all">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="received">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {receivedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="inProgress">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="resolved">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resolvedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
