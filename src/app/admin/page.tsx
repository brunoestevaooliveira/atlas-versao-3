
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Issue } from '@/lib/types';
import { listenToIssues, updateIssueStatus, deleteIssue } from '@/services/issue-service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Shield, Trash2, Search, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';

export default function AdminPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logout, appUser } = useAuth();
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');

  useEffect(() => {
      if (appUser) { // Only listen to issues if user is authenticated
        const unsubscribe = listenToIssues((issues) => {
          setIssues(issues);
          setLoading(false);
        });
        return () => unsubscribe();
      }
  }, [appUser]);

  const uniqueCategories = useMemo(() => {
    return ['all', ...new Set(issues.map(issue => issue.category))];
  }, [issues]);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues;

    // 1. Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // 2. Filter by address
    if (addressFilter.trim() !== '') {
      filtered = filtered.filter(issue => 
        issue.address.toLowerCase().includes(addressFilter.toLowerCase())
      );
    }

    // 3. Sort
    if (sortOrder === 'upvotes') {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      filtered.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
    }

    return filtered;
  }, [issues, categoryFilter, addressFilter, sortOrder]);


  const handleStatusChange = async (issueId: string, newStatus: Issue['status']) => {
    try {
      await updateIssueStatus(issueId, newStatus);
      toast({
        title: 'Status Atualizado!',
        description: `A ocorrência foi marcada como "${newStatus}".`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível alterar o status da ocorrência.',
      });
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    try {
      await deleteIssue(issueId);
      toast({
        title: "Ocorrência Excluída",
        description: "A ocorrência foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir ocorrência:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: "Não foi possível remover a ocorrência.",
      });
    }
  };

  const getStatusVariant = (status: Issue['status']): "success" | "warning" | "info" => {
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


  return (
    <div className="container mx-auto py-8 mt-20 space-y-8">
      <header className="space-y-2 text-center">
        <div className="flex justify-center items-center gap-4">
            <div className="inline-block bg-primary text-primary-foreground p-3 rounded-full">
                <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold font-headline">Painel do Administrador</h1>
            <Button variant="outline" size="icon" onClick={logout} className="ml-4">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sair</span>
            </Button>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gerencie o status de todas as ocorrências reportadas pela comunidade.
        </p>
      </header>

      <Card className="p-4 bg-muted/30">
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
              <SelectItem value="upvotes">Prioridade (Apoios)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocorrências</CardTitle>
          <CardDescription>
            Encontrado {filteredAndSortedIssues.length} de {issues.length} ocorrências.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Apoios</TableHead>
                  <TableHead>Status Atual</TableHead>
                  <TableHead>Alterar Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando ocorrências...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedIssues.length > 0 ? (
                  filteredAndSortedIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.title}</TableCell>
                      <TableCell>{issue.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-primary" />
                          {issue.upvotes}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(issue.status)}>{getStatusText(issue.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={issue.status}
                          onValueChange={(newStatus: Issue['status']) =>
                            handleStatusChange(issue.id, newStatus)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Mudar status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Recebido">Recebido</SelectItem>
                            <SelectItem value="Em análise">Em análise</SelectItem>
                            <SelectItem value="Resolvido">Resolvido</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a ocorrência
                                "{issue.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteIssue(issue.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Nenhuma ocorrência encontrada com os filtros aplicados.
                    </TableCell>
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
