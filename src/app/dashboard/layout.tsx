/**
 * @file src/app/dashboard/layout.tsx
 * @fileoverview Layout para a rota do Dashboard de Análise.
 * Este componente atua como um portão de segurança, similar ao AdminLayout.
 * Ele garante que apenas usuários administradores possam acessar a página
 * do dashboard, mostrando telas de carregamento ou acesso negado conforme necessário.
 */

'use client';

import { useAuth } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Layout de proteção para a página do Dashboard.
 * @param {object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - A página do dashboard a ser renderizada.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Hook para obter o estado de autenticação e permissões.
  const { appUser, isLoading, isAdmin } = useAuth();

  // Exibe uma tela de carregamento enquanto as informações do usuário são verificadas.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-10 w-32 mt-4" />
      </div>
    );
  }

  // Se o usuário não for um administrador, exibe uma mensagem de acesso negado.
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

  // Se o usuário for um administrador, renderiza a página do dashboard.
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
