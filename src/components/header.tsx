'use client';

import Link from 'next/link';
import { Compass, FilePlus, BarChart, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet';

const navLinks = [
  { href: '/', label: 'Início', icon: <Compass className="h-5 w-5" /> },
  { href: '/report', label: 'Reportar', icon: <FilePlus className="h-5 w-5" /> },
  { href: '/tracking', label: 'Acompanhar', icon: <BarChart className="h-5 w-5" /> },
  { href: '/search', label: 'Buscar', icon: <Search className="h-5 w-5" /> },
];

const Header: React.FC = () => {
  const pathname = usePathname();

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

        <div className="hidden md:flex items-center">
         <NavContent />
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
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
};

export default Header;
