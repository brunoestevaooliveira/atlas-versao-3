
'use client';

import Link from 'next/link';
import { Compass, FilePlus, BarChart, Search, LogIn, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { loginWithGoogle, logout } from '@/services/auth-service';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navLinks = [
  { href: '/', label: 'Início', icon: <Compass className="h-5 w-5" /> },
  { href: '/report', label: 'Reportar', icon: <FilePlus className="h-5 w-5" /> },
  { href: '/tracking', label: 'Acompanhar', icon: <BarChart className="h-5 w-5" /> },
  { href: '/search', label: 'Buscar', icon: <Search className="h-5 w-5" /> },
];

const Header: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
  };

  const UserActions = () => {
    if (user) {
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.displayName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      );
    }
    return (
      <Button variant="ghost" size="sm" onClick={handleLogin}>
        <LogIn className="mr-2 h-4 w-4" />
        Login com Google
      </Button>
    );
  };

  const NavContent = () => (
     <nav className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 text-sm font-medium">
      {navLinks.map(({ href, label }) => (
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

  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4">
      <div className="container flex h-16 items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Compass className="h-6 w-6 text-primary" />
            <span className='text-foreground'>Atlas Cívico</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
         <NavContent />
         <div className="w-px h-6 bg-border mx-2"></div>
         <UserActions />
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
                 <div className="border-t pt-6">
                    <UserActions />
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
};

export default Header;
