
'use client';

import { useAuth } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading } = useAuth();

  // 1. Enquanto os dados de autenticação estão sendo carregados, exibe uma tela de loading.
  // Isso é a etapa mais crucial para evitar a condição de corrida.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Verificando autorização de administrador...</p>
      </div>
    );
  }

  // 2. Após o carregamento, se o usuário NÃO for um admin, exibe a tela de acesso negado.
  // Esta verificação só ocorre depois que 'isLoading' é falso, garantindo que 'appUser' tenha seu valor final.
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

  // 3. Se o carregamento terminou e o usuário é um admin, renderiza o conteúdo da página.
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
