
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Não faz nada enquanto os dados do usuário estão carregando
    if (isLoading) {
      return;
    }

    // Se o carregamento terminou e o usuário não é um admin, redireciona para a home
    if (appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, isLoading, router]);

  // Enquanto carrega, mostra uma tela em branco ou um spinner
  if (isLoading || appUser?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Verificando autorização de administrador...</p>
      </div>
    );
  }

  // Se o usuário é admin, renderiza o conteúdo da página
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
