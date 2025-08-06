'use client';

import Link from 'next/link';
import { MapPin, BarChart, FilePlus, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Mapa', icon: <MapPin className="h-5 w-5" /> },
  { href: '/report', label: 'Reportar', icon: <FilePlus className="h-5 w-5" /> },
  { href: '/tracking', label: 'Acompanhar', icon: <BarChart className="h-5 w-5" /> },
  { href: '/search', label: 'Buscar', icon: <Search className="h-5 w-5" /> },
];

const Header: React.FC = () => {
  const pathname = usePathname();

  const NavContent = () => (
     <nav className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 text-sm font-medium">
      {navLinks.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-2 transition-colors hover:text-primary',
            pathname === href ? 'text-primary font-bold' : 'text-muted-foreground',
          )}
        >
          {icon}
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <MapPin className="h-6 w-6 text-primary" />
            <span>Santa Maria Ativa</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-end">
         <NavContent />
        </div>
        
        <div className="md:hidden flex flex-1 justify-end">
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
