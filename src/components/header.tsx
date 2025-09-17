
'use client';

import Link from 'next/link';
import { Compass, FilePlus, BarChart, Search, LineChart, Shield, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
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
import { Separator } from './ui/separator';


const baseNavLinks = [
  { href: '/', label: 'Mapa' },
  { href: '/report', label: 'Reportar' },
  { href: '/tracking', label: 'Acompanhar' },
];

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground dark:text-white" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

const Header: React.FC = () => {
  const pathname = usePathname();
  const { appUser, logout, isAdmin } = useAuth();

  const NavContent = () => {
    const navLinks = [...baseNavLinks];
    if (isAdmin) {
      navLinks.splice(3, 0, { href: '/dashboard', label: 'Dashboard' });
      navLinks.push({ href: '/admin', label: 'Admin' });
    }

    return (
      <nav className="hidden md:flex flex-row items-start md:items-center gap-1 md:gap-2 text-sm font-medium">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-3 py-1.5 rounded-md transition-colors text-foreground dark:text-white font-semibold hover:bg-black/10 dark:hover:bg-white/20',
              pathname === href ? 'bg-black/10 dark:bg-white/30' : 'hover:bg-black/5 dark:hover:bg-white/10',
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    );
  };
  
  const UserMenu = () => {
    if (!appUser) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary/50 hover:border-primary transition-all">
                  <AvatarImage src={appUser?.photoURL || undefined} alt={appUser?.name || 'User'} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">{getInitials(appUser?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <p>Minha Conta</p>
                <p className="text-xs text-muted-foreground font-normal">{appUser?.email}</p>
                </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem asChild>
                    <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }

  const MobileNavContent = () => {
    const navLinks = [...baseNavLinks];
    if (isAdmin) {
      navLinks.push({ href: '/dashboard', label: 'Dashboard' });
      navLinks.push({ href: '/admin', label: 'Admin' });
    }

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2 text-lg">
                {navLinks.map(({ href, label }) => (
                    <SheetClose asChild key={href}>
                        <Link
                            href={href}
                            className={cn(
                                'px-3 py-2 rounded-md transition-colors text-foreground dark:text-white font-semibold',
                                pathname === href ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10',
                            )}
                        >
                            {label}
                        </Link>
                    </SheetClose>
                ))}
            </div>

            {appUser && (
                <div className="mt-auto">
                    <Separator className="my-4"/>
                    <Button onClick={logout} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </Button>
                </div>
            )}
        </div>
    )
  }

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md md:max-w-7xl px-4">
      <div className="container flex h-16 items-center justify-between rounded-lg border border-white/20 bg-white/30 dark:bg-black/30 px-4 md:px-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Compass className="h-6 w-6 text-primary" />
            <span className='hidden md:inline text-primary-foreground'>Atlas Cívico</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavContent />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {appUser && (
              <>
                <div className="w-px h-6 bg-border" />
                <UserMenu />
              </>
            )}
          </div>
        </div>
        
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
           {appUser && <UserMenu />}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] flex flex-col">
                <SheetHeader className='text-left mb-4'>
                    <SheetTitle className='sr-only'>Navegação Principal</SheetTitle>
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Compass className="h-7 w-7 text-primary" />
                        <span className='text-primary-foreground'>Atlas Cívico</span>
                    </Link>
                </SheetHeader>
                <MobileNavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
