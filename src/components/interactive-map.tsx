import { issues } from '@/lib/data';
import type { Issue } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';

const InteractiveMap = () => {
  const recentIssues = issues.slice(0, 5);

  const getStatusVariant = (status: Issue['status']) => {
    switch (status) {
      case 'Resolvido':
        return 'default';
      case 'Em análise':
        return 'secondary';
      case 'Recebido':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className="grid md:grid-cols-3">
        <div className="md:col-span-2 relative h-96 md:h-full min-h-[400px]">
          <Image
            src="https://placehold.co/1200x800.png"
            alt="Mapa de Santa Maria-DF"
            layout="fill"
            objectFit="cover"
            data-ai-hint="city map"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <div className="absolute top-1/4 left-1/3">
                <MapPin className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="absolute bottom-1/4 right-1/4">
                <MapPin className="w-6 h-6 text-blue-400" />
            </div>
             <div className="absolute top-1/3 right-1/3">
                <MapPin className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="md:col-span-1 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-primary" />
              Ocorrências Recentes
            </CardTitle>
            <CardDescription>
              As últimas questões reportadas pela comunidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-4">
              {recentIssues.map(issue => (
                <li key={issue.id} className="flex items-start gap-3">
                    <div className="mt-1">
                        <Badge variant={getStatusVariant(issue.status)} className="text-xs w-20 justify-center text-center">{issue.status}</Badge>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.category}</p>
                    </div>
                </li>
              ))}
            </ul>
             <Button asChild variant="outline" className="w-full">
              <Link href="/tracking">
                Ver Todas as Ocorrências <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default InteractiveMap;
