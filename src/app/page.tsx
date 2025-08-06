import InteractiveMap from '@/components/interactive-map';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Atlas Cívico</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Mapeando problemas, construindo soluções. Sua voz para uma cidade melhor.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button asChild>
            <Link href="/report">Reportar Ocorrência <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
           <Button asChild variant="outline">
            <Link href="/search">Explorar Dados</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-6">Mapa Interativo de Ocorrências</h2>
        <InteractiveMap />
      </section>
    </div>
  );
}
