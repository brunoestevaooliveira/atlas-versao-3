
'use client';

import { useAuth } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-10 w-32 mt-4" />
      </div>
    );
  }

  // Hardcoded check for the specific admin email to bypass any database role issues.
  if (appUser?.email !== 'ylhito0307@gmail.com') {
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

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
