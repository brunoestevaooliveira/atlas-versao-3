
'use client';

import { useState, useEffect, useMemo } from 'react';
import { listenToIssues } from '@/services/issue-service';
import type { Issue } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Hourglass, PieChart, BarChart, LineChart as LucideLineChart, Filter } from 'lucide-react';
import CategoryChart from '@/components/charts/category-chart';
import StatusChart from '@/components/charts/status-chart';
import TimelineChart from '@/components/charts/timeline-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Issue['status']>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    const unsubscribe = listenToIssues((fetchedIssues) => {
      setIssues(fetchedIssues);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const uniqueCategories = useMemo(() => {
    return ['all', ...new Set(issues.map(issue => issue.category))];
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter;
      const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
      const dateMatch = !dateRange?.from || !dateRange?.to || 
                        (issue.reportedAt >= dateRange.from && issue.reportedAt <= dateRange.to);
      return categoryMatch && statusMatch && dateMatch;
    });
  }, [issues, categoryFilter, statusFilter, dateRange]);


  const stats = useMemo(() => {
    return {
      total: filteredIssues.length,
      resolved: filteredIssues.filter((issue) => issue.status === 'Resolvido').length,
      inProgress: filteredIssues.filter((issue) => issue.status === 'Em análise').length,
      received: filteredIssues.filter((issue) => issue.status === 'Recebido').length,
    };
  }, [filteredIssues]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto py-8 pt-24 space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold font-headline">Dashboard de Análise</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visualize os dados sobre as ocorrências reportadas em tempo real.
          </p>
        </header>

        <Card className="p-4 bg-card/80">
          <CardHeader className="p-2 pt-0">
              <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground"/>
                  Filtros de Análise
              </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 p-2 items-center">
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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="flex-1 w-full sm:w-auto">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Em análise">Em análise</SelectItem>
                <SelectItem value="Resolvido">Resolvido</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>


        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total de relatos no período.</p>
              </CardContent>
              </Card>
              <Card className="bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.resolved}</div>
                  <p className="text-xs text-muted-foreground">Ocorrências marcadas como resolvidas.</p>
              </CardContent>
              </Card>
              <Card className="bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
                  <Hourglass className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">Ocorrências em andamento.</p>
              </CardContent>
              </Card>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          <Card className="lg:col-span-2 bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-muted-foreground"/>
                <CardTitle>Ocorrências por Categoria</CardTitle>
              </div>
              <CardDescription>Distribuição dos tipos de problemas mais comuns.</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryChart issues={filteredIssues} loading={loading} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-muted-foreground"/>
                <CardTitle>Status das Ocorrências</CardTitle>
              </div>
              <CardDescription>Contagem de ocorrências por status atual.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusChart issues={filteredIssues} loading={loading} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LucideLineChart className="h-5 w-5 text-muted-foreground"/>
                <CardTitle>Linha do Tempo das Ocorrências</CardTitle>
              </div>
              <CardDescription>Volume de novas ocorrências reportadas ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart issues={filteredIssues} loading={loading} />
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
