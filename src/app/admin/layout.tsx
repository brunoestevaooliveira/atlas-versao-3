
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading } = useAuth();
  const router = useRouter();

  // Enquanto os dados de autenticação estão sendo carregados, exibe uma tela de loading.
  // Isso é crucial para evitar a condição de corrida.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Verificando autorização de administrador...</p>
      </div>
    );
  }

  // Após o carregamento, se o usuário não for um admin, exibe acesso negado.
  // Renderização condicional é mais segura que useEffect para redirecionamento aqui.
  if (appUser?.role !== 'admin') {
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

  // Se o carregamento terminou e o usuário é um admin, renderiza o conteúdo da página.
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
