
// src/app/admin/layout.tsx
'use client';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !appUser) {
      router.push('/admin/login');
    }
  }, [appUser, isLoading, router]);

  if (isLoading || !appUser) {
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
