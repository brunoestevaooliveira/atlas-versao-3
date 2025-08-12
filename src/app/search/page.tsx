
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Issue } from '@/lib/types';
import { listenToIssues } from '@/services/issue-service';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const unsubscribe = listenToIssues((issues) => {
      setAllIssues(issues);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(allIssues.map(issue => issue.category))];
  }, [allIssues]);

  const filteredIssues = useMemo(() => {
    return allIssues.filter(issue => {
      const searchTermMatch = searchTerm.trim() === '' ||
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter;
      const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
      
      const dateMatch = dateFilter === '' || 
        format(issue.reportedAt, 'yyyy-MM-dd') === dateFilter;

      return searchTermMatch && categoryMatch && statusMatch && dateMatch;
    });
  }, [allIssues, searchTerm, categoryFilter, statusFilter, dateFilter]);

  const getStatusVariant = (status: Issue['status']) => {
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

  return (
    <div className="container mx-auto py-8 mt-20 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold font-headline">Buscar Dados Cívicos</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Explore os dados de ocorrências reportadas em Santa Maria-DF.</p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Busca</CardTitle>
          <CardDescription>Refine sua busca por ocorrências.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar por palavra-chave..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Recebido">Recebido</SelectItem>
              <SelectItem value="Em análise">Em análise</SelectItem>
              <SelectItem value="Resolvido">Resolvido</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="date" 
            placeholder="Filtrar por data" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Resultados da Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Reportado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.title}</TableCell>
                      <TableCell>{issue.category}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell>{format(issue.reportedAt, 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{issue.reporter}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">Nenhuma ocorrência encontrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
