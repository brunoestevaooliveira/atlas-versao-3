'use client';

import { issues } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MapPin, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';
import type { Issue } from '@/lib/types';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg" />
});

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
    <Card className="shadow-lg overflow-hidden bg-transparent border-border">
      <div className="grid md:grid-cols-3">
        <div className="md:col-span-2 relative h-96 md:h-full min-h-[400px]">
          <Map issues={issues} />
        </div>

        <div className="md:col-span-1 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin />
              Ocorrências Recentes
            </CardTitle>
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
             <Button asChild variant="secondary" className="w-full">
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
