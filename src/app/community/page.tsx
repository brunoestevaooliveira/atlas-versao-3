/**
 * @file src/app/community/page.tsx
 * @fileoverview Página da Comunidade, exibindo um ranking de usuários mais ativos.
 * Esta página busca todos os usuários do Firestore, os ordena pelo número
 * de ocorrências reportadas e exibe um ranking com medalhas, avatares, nomes,
 * contagens de contribuições e títulos cívicos.
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Medal, Shield, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Retorna as iniciais de um nome para usar no AvatarFallback.
 * @param name O nome do usuário.
 */
const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
};

/**
 * Determina o título cívico e a cor do ícone com base no número de ocorrências reportadas.
 * @param count O número de ocorrências reportadas.
 * @returns Um objeto com o título e a classe de cor.
 */
const getCivicTitle = (count: number): { title: string; color: string } => {
  if (count >= 25) return { title: 'Guardião da Cidade', color: 'text-amber-400' };
  if (count >= 10) return { title: 'Vigilante Cívico', color: 'text-slate-400' };
  if (count >= 5) return { title: 'Colaborador Ativo', color: 'text-orange-400' };
  return { title: 'Cidadão Participante', color: 'text-muted-foreground' };
};

/**
 * Retorna o ícone e a cor da medalha com base na posição do ranking.
 * @param rank O índice do usuário no ranking (começando em 0).
 * @returns Um objeto com o componente do ícone e a classe de cor.
 */
const getRankMedal = (rank: number): { icon: JSX.Element; color: string } => {
  if (rank === 0) return { icon: <Medal />, color: 'text-yellow-500' };
  if (rank === 1) return { icon: <Medal />, color: 'text-slate-400' };
  if (rank === 2) return { icon: <Medal />, color: 'text-orange-500' };
  return { icon: <Star />, color: 'text-muted-foreground/50' };
};

/**
 * Componente principal da página da Comunidade.
 */
export default function CommunityPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Efeito para buscar os usuários do Firestore quando o componente é montado.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCol = collection(db, 'users');
        // Ordena os usuários pelo número de ocorrências reportadas em ordem decrescente.
        const q = query(usersCol, orderBy('issuesReported', 'desc'));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => doc.data() as AppUser);
        setUsers(usersList);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto py-8 pt-24 max-w-4xl space-y-8">
        <header className="space-y-2 text-center">
          <div className="inline-block bg-primary text-primary-foreground p-3 rounded-full mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-headline">Comunidade Ativa</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça e celebre os cidadãos que mais colaboram para uma cidade melhor.
          </p>
        </header>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Ranking de Colaboradores</CardTitle>
            <CardDescription>Usuários com o maior número de ocorrências reportadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              // Exibe um esqueleto de carregamento enquanto os dados são buscados.
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Renderiza a lista de usuários.
              <ul className="space-y-2">
                {users.map((user, index) => {
                  const titleInfo = getCivicTitle(user.issuesReported || 0);
                  const medalInfo = getRankMedal(index);
                  return (
                    <li
                      key={user.uid}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg transition-colors",
                        index < 3 ? 'bg-primary/5 dark:bg-primary/10' : 'bg-transparent'
                      )}
                    >
                      {/* Posição no Ranking e Medalha */}
                      <div className="flex items-center gap-3 w-12">
                        <span className="font-bold text-lg text-muted-foreground w-6 text-center">{index + 1}</span>
                        <span className={cn("h-6 w-6", medalInfo.color)}>{medalInfo.icon}</span>
                      </div>
                      
                      {/* Avatar e Nome */}
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      
                      {/* Informações do Usuário */}
                      <div className="flex-1">
                        <p className="font-bold text-base text-foreground">{user.name}</p>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-semibold", titleInfo.color)}>{titleInfo.title}</span>
                             {user.role === 'admin' && (
                                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                </Badge>
                             )}
                        </div>
                      </div>
                      
                      {/* Contagem de Contribuições */}
                      <div className="text-right">
                        <p className="font-bold text-xl text-primary">{user.issuesReported || 0}</p>
                        <p className="text-xs text-muted-foreground">Ocorrências</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {!loading && users.length === 0 && (
                <p className="text-center text-muted-foreground py-10">Nenhum usuário no ranking ainda. Seja o primeiro a reportar uma ocorrência!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
