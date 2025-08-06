import { issues } from '@/lib/data';
import type { Issue } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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

  // Approximate bounding box for Santa Maria, DF for mapping lat/lng to image coordinates
  const bounds = {
    top: -15.910, 
    bottom: -15.930,
    left: -48.050,
    right: -48.025, 
  };

  const getPositionOnMap = (lat: number, lng: number) => {
    const top = ((lat - bounds.bottom) / (bounds.top - bounds.bottom)) * 100;
    const left = ((lng - bounds.left) / (bounds.right - bounds.left)) * 100;
    return { top: `${100 - top}%`, left: `${left}%` };
  };

  const getPinColor = (status: Issue['status']) => {
    switch (status) {
      case 'Resolvido':
        return 'text-green-500';
      case 'Em análise':
        return 'text-yellow-400';
      case 'Recebido':
        return 'text-blue-400';
      default:
        return 'text-red-500';
    }
  }

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
          <div className="absolute inset-0 bg-black/20">
             <TooltipProvider>
              {issues.map(issue => {
                const { top, left } = getPositionOnMap(issue.location.lat, issue.location.lng);
                return (
                  <Tooltip key={issue.id}>
                    <TooltipTrigger asChild>
                      <div className="absolute" style={{ top, left, transform: 'translate(-50%, -50%)' }}>
                        <MapPin className={`w-6 h-6 ${getPinColor(issue.status)} animate-pulse`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{issue.title}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
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
