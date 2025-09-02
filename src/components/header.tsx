
'use client';

import Link from 'next/link';
import { Compass, FilePlus, BarChart, Search, LineChart, Shield, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTheme } from 'next-themes';


const baseNavLinks = [
  { href: '/', label: 'Mapa' },
  { href: '/report', label: 'Reportar' },
  { href: '/tracking', label: 'Acompanhar' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/search', label: 'Buscar' },
];

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


const Header: React.FC = () => {
  const pathname = usePathname();
  const { appUser, logout } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const NavContent = () => {
    const navLinks = [...baseNavLinks];
    if (appUser?.role === 'admin') {
      navLinks.push({ href: '/admin', label: 'Admin' });
    }

    return (
      <nav className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 text-sm font-medium">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'transition-colors hover:text-primary flex items-center gap-2',
              pathname === href ? 'text-primary font-semibold' : 'text-foreground/80',
            )}
          >
            {label === 'Admin' && <Shield className="h-5 w-5" />}
            {label}
          </Link>
        ))}
      </nav>
    );
  };

  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4">
      <div className="container flex h-16 items-center justify-between rounded-lg border bg-background/95 backdrop-blur-sm px-6 shadow-md dark:bg-card/80">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Compass className="h-6 w-6 text-primary" />
            <span className='text-foreground'>Atlas Cívico</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavContent />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {appUser && (
              <>
              <div className="w-px h-6 bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={appUser?.photoURL || undefined} alt={appUser?.name || 'User'} />
                      <AvatarFallback>{getInitials(appUser?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <p>Minha Conta</p>
                    <p className="text-xs text-muted-foreground font-normal">{appUser?.email}</p>
                    </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            )}
          </div>
        </div>
        
        <div className="md:hidden flex items-center">
           {appUser && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full mr-2">
                  <Avatar>
                    <AvatarImage src={appUser?.photoURL || undefined} alt={appUser?.name || 'User'} />
                    <AvatarFallback>{getInitials(appUser?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <p>Minha Conta</p>
                  <p className="text-xs text-muted-foreground font-normal">{appUser?.email}</p>
                  </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           )}
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-8">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
};

export default Header;
