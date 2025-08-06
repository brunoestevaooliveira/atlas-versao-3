import InteractiveMap from '@/components/interactive-map';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center bg-card p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary">Bem-vindo ao Santa Maria Ativa</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Sua plataforma para reportar problemas, acompanhar soluções e participar ativamente na melhoria da nossa cidade.
        </p>
        <Button asChild className="mt-6">
          <Link href="/report">Reportar uma Ocorrência</Link>
        </Button>
      </section>

      <section>
        <InteractiveMap />
      </section>
    </div>
  );
}
