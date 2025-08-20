
'use client';

import { useState, useEffect } from 'react';
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
import { LogOut, Shield, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
      const unsubscribe = listenToIssues((issues) => {
        setIssues(issues);
        setLoading(false);
      });
      return () => unsubscribe();
  }, []);

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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocorrências</CardTitle>
          <CardDescription>
            Altere o status ou exclua as ocorrências para manter os dados atualizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status Atual</TableHead>
                  <TableHead>Alterar Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Carregando ocorrências...
                    </TableCell>
                  </TableRow>
                ) : issues.length > 0 ? (
                  issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.title}</TableCell>
                      <TableCell>{issue.category}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={issue.status}
                          onValueChange={(newStatus) =>
                            handleStatusChange(issue.id, newStatus as Issue['status'])
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
                    <TableCell colSpan={5} className="text-center py-10">
                      Nenhuma ocorrência reportada ainda.
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

function ProtectedAdminPage() {
  const { appUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o carregamento terminou e o usuário não é admin, redireciona.
    if (!isLoading && appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, isLoading, router]);
  
  // Exibe a tela de carregamento enquanto o status de autenticação está sendo verificado
  // ou enquanto o appUser ainda não foi carregado. Isso resolve a condição de corrida.
  if (isLoading || !appUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Verificando autorização de administrador...</p>
      </div>
    );
  }

  // Se o usuário é um administrador, renderiza o dashboard.
  // Caso contrário, retorna null pois o useEffect já iniciou o redirecionamento.
  if (appUser.role === 'admin') {
    return <AdminDashboard />;
  }

  // Se não for admin, o useEffect já está redirecionando. Exibe tela de carregamento.
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <p>Acesso negado. Redirecionando...</p>
    </div>
  );
}


export default function AdminPage() {
  return <ProtectedAdminPage />;
}
