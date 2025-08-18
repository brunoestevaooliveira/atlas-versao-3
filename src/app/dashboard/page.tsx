
'use client';

import { useState, useEffect, useMemo } from 'react';
import { listenToIssues } from '@/services/issue-service';
import type { Issue } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Hourglass, PieChart, BarChart, LineChart as LucideLineChart } from 'lucide-react';
import CategoryChart from '@/components/charts/category-chart';
import StatusChart from '@/components/charts/status-chart';
import TimelineChart from '@/components/charts/timeline-chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToIssues((issues) => {
      setIssues(issues);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      resolved: issues.filter((issue) => issue.status === 'Resolvido').length,
      inProgress: issues.filter((issue) => issue.status === 'Em análise').length,
      received: issues.filter((issue) => issue.status === 'Recebido').length,
    };
  }, [issues]);

  return (
    <div className="container mx-auto py-8 mt-20 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold font-headline">Dashboard de Análise</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Visualize os dados sobre as ocorrências reportadas em tempo real.
        </p>
      </header>

      {loading ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total de relatos na plataforma.</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                 <p className="text-xs text-muted-foreground">Ocorrências marcadas como resolvidas.</p>
            </CardContent>
            </Card>
             <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
                <Hourglass className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                 <p className="text-xs text-muted-foreground">Ocorrências em andamento.</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Apoiadores</CardTitle>
                 <span className="text-2xl">❤️</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{issues.reduce((acc, issue) => acc + issue.upvotes, 0)}</div>
                <p className="text-xs text-muted-foreground">Soma de todos os apoios.</p>
            </CardContent>
            </Card>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-muted-foreground"/>
              <CardTitle>Ocorrências por Categoria</CardTitle>
            </div>
            <CardDescription>Distribuição dos tipos de problemas mais comuns.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart issues={issues} loading={loading} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
             <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-muted-foreground"/>
              <CardTitle>Status das Ocorrências</CardTitle>
            </div>
            <CardDescription>Contagem de ocorrências por status atual.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart issues={issues} loading={loading} />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
             <div className="flex items-center gap-2">
              <LucideLineChart className="h-5 w-5 text-muted-foreground"/>
              <CardTitle>Linha do Tempo das Ocorrências</CardTitle>
            </div>
            <CardDescription>Volume de novas ocorrências reportadas ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineChart issues={issues} loading={loading} />
          </CardContent>
        </Card>
    </div>
  );
}
