
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Issue } from '@/lib/types';
import { listenToIssues, updateIssueStatus } from '@/services/issue-service';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function AdminPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showLoginPrompt, setShowLoginPrompt] = useState(true);


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
    <>
    <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Acesso Restrito
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta área é destinada apenas para administradores e pessoal autorizado. Para continuar, você precisaria fazer login com uma conta verificada.
              <br/><br/>
              (Esta é uma demonstração. A funcionalidade de login de administrador ainda não foi implementada.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLoginPrompt(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>>
      
    <div className="container mx-auto py-8 mt-20 space-y-8">
      <header className="space-y-2 text-center">
        <div className="inline-block bg-primary text-primary-foreground p-3 rounded-full">
            <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-headline">Painel do Administrador</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gerencie o status de todas as ocorrências reportadas pela comunidade.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocorrências</CardTitle>
          <CardDescription>
            Altere o status de cada ocorrência para manter a comunidade informada.
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
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
    </>
  );
}
