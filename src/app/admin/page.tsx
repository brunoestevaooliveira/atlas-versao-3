/**
 * @file src/app/admin/page.tsx
 * @fileoverview Página do painel de administração para gerenciamento de ocorrências.
 * Permite que administradores visualizem, filtrem, ordenem, atualizem o status e excluam
 * todas as ocorrências reportadas na plataforma.
 */

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
import { useDebounce } from 'use-debounce';

/**
 * Componente principal da página de administração.
 */
export default function AdminPage() {
  // --- ESTADOS ---
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logout, appUser } = useAuth();
  
  // Estados para os controles de filtro e ordenação
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addressFilter, setAddressFilter] = useState('');
  const [debouncedAddressFilter] = useDebounce(addressFilter, 300);
  const [sortOrder, setSortOrder] = useState('recent');

  // --- EFEITOS ---
  // Se inscreve para ouvir atualizações em tempo real das ocorrências do Firestore.
  useEffect(() => {
      // Garante que a escuta só comece se o usuário estiver autenticado.
      if (appUser) {
        const unsubscribe = listenToIssues((issues) => {
          setIssues(issues);
          setLoading(false);
        });
        return () => unsubscribe(); // Cancela a inscrição ao desmontar o componente.
      }
  }, [appUser]);


  // --- MEMOS ---

  // Extrai categorias únicas da lista de ocorrências para popular o filtro de categorias.
  const uniqueCategories = useMemo(() => {
    return ['all', ...new Set(issues.map(issue => issue.category))];
  }, [issues]);

  // Filtra e ordena a lista de ocorrências com base nos estados dos filtros.
  // É recalculado apenas quando as dependências mudam, otimizando a performance.
  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    if (debouncedAddressFilter.trim() !== '') {
      filtered = filtered.filter(issue => 
        issue.address.toLowerCase().includes(debouncedAddressFilter.toLowerCase())
      );
    }

    if (sortOrder === 'upvotes') {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else { // 'recent'
      filtered.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
    }

    return filtered;
  }, [issues, categoryFilter, debouncedAddressFilter, sortOrder]);


  // --- FUNÇÕES ---

  /**
   * Manipula a mudança de status de uma ocorrência, chamando o serviço correspondente.
   * @param issueId O ID da ocorrência a ser atualizada.
   * @param newStatus O novo status a ser aplicado.
   */
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

  /**
   * Manipula a exclusão de uma ocorrência.
   * @param issueId O ID da ocorrência a ser excluída.
   */
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

  /**
   * Retorna a variante de cor para o Badge com base no status.
   * @param status O status da ocorrência.
   */
  const getStatusVariant = (status: Issue['status']): "success" | "warning" | "info" => {
    switch (status) {
      case 'Resolvido':
        return 'success';
      case 'Em análise':
        return 'warning';
      case 'Recebido':
      default:
        return 'info';
    }
  };
  
  /**
   * Retorna o texto formatado para o status (ex: 'Em análise' -> 'Análise').
   * @param status O status da ocorrência.
   */
  const getStatusText = (status: Issue['status']) => {
    return status === 'Em análise' ? 'Análise' : status;
  };


  // --- RENDERIZAÇÃO ---
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto py-8 pt-24 space-y-8">
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

        {/* Card com os controles de filtro e ordenação */}
        <Card className="p-4 bg-card/80">
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

        {/* Card com a tabela de ocorrências */}
        <Card className="bg-card/80">
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
                      <TableRow key={issue.id} className="hover:bg-muted/10">
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
    </div>
  );
}
