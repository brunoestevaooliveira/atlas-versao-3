
// src/app/admin/layout.tsx
import { Toaster } from '@/components/ui/toaster';

// O layout de admin agora apenas fornece a estrutura básica e o Toaster.
// A lógica de proteção foi movida para a página específica que precisa dela.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
