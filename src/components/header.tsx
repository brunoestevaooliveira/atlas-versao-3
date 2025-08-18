
'use client';

import Link from 'next/link';
import { Compass, FilePlus, BarChart, Search, Shield, LineChart, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/mapa', label: 'Mapa', icon: <Compass className="h-5 w-5" /> },
  { href: '/report', label: 'Reportar', icon: <FilePlus className="h-5 w-5" /> },
  { href: '/tracking', label: 'Acompanhar', icon: <BarChart className="h-5 w-5" /> },
  { href: '/dashboard', label: 'Dashboard', icon: <LineChart className="h-5 w-5" /> },
  { href: '/search', label: 'Buscar', icon: <Search className="h-5 w-5" /> },
];

const adminLink = { href: '/admin', label: 'Admin', icon: <Shield className="h-5 w-5" /> };


const Header: React.FC = () => {
  const pathname = usePathname();
  const { logout, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
       toast({
        title: 'Você saiu!',
        description: 'Sessão encerrada com sucesso.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: 'Não foi possível encerrar a sessão.',
      });
    }
  }

  const NavContent = () => {
    const allLinks = isAdmin ? [...navLinks, adminLink] : navLinks;
    return (
        <nav className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 text-sm font-medium">
        {allLinks.map(({ href, label }) => (
            <Link
            key={href}
            href={href}
            className={cn(
                'transition-colors hover:text-primary',
                pathname === href ? 'text-primary font-semibold' : 'text-foreground/80',
            )}
            >
            {label}
            </Link>
        ))}
        </nav>
    );
  };

  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4">
      <div className="container flex h-16 items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <Link href="/mapa" className="flex items-center gap-2 font-bold text-lg">
            <Compass className="h-6 w-6 text-primary" />
            <span className='text-foreground'>Atlas Cívico</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
         <NavContent />
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="md:hidden flex">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white">
              <div className="flex flex-col gap-6 pt-8">
                <NavContent />
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
};

export default Header;
