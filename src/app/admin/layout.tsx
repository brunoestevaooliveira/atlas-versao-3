
// src/app/admin/layout.tsx
import { Toaster } from '@/components/ui/toaster';

// O layout de admin agora apenas fornece a estrutura básica e o Toaster.
// A lógica de proteção foi movida para o layout principal (src/app/layout.tsx).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
