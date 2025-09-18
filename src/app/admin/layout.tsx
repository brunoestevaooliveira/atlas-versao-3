/**
 * @file src/app/admin/layout.tsx
 * @fileoverview Layout para as rotas da área de administração.
 * Este componente envolve as páginas de administração e é responsável por
 * proteger o acesso, garantindo que apenas usuários com a permissão 'isAdmin'
 * possam visualizar o conteúdo. Ele exibe uma tela de carregamento enquanto
 * verifica a permissão e uma tela de "Acesso Negado" caso o usuário não seja um administrador.
 */

'use client';

import { useAuth } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Layout de proteção para as páginas de administração.
 * @param {object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - As páginas aninhadas que este layout irá envolver.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hook para obter o estado de autenticação e as permissões do usuário.
  const { isLoading, isAdmin } = useAuth();

  // Durante a verificação do status de admin, exibe um esqueleto de carregamento
  // para evitar que o conteúdo da página "pisque" na tela.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-10 w-32 mt-4" />
      </div>
    );
  }

  // Se o carregamento terminou e o usuário não é um administrador,
  // exibe uma mensagem de acesso negado e um botão para voltar à página inicial.
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <Button asChild>
            <Link href="/">Voltar para a Página Inicial</Link>
        </Button>
      </div>
    );
  }

  // Se o usuário é um administrador, renderiza o conteúdo da página.
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
