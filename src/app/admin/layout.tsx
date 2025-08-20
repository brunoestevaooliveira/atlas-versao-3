

// src/app/admin/layout.tsx
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!appUser || appUser.role !== 'admin')) {
      router.push('/');
    }
  }, [appUser, isLoading, router]);

  if (isLoading || !appUser || appUser.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Verificando autorização de administrador...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProtectedAdminLayout>{children}</ProtectedAdminLayout>
      <Toaster />
    </>
  );
}
