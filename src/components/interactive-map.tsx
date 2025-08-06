'use client';

import { issues } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin, ArrowRight, Search, Layers } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';
import type { Issue } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const Map = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
});

const InteractiveMap = () => {
  const recentIssues = issues.slice(0, 5);

  const getStatusVariant = (status: Issue['status']) => {
    switch (status) {
      case 'Resolvido':
        return 'success';
      case 'Em análise':
        return 'secondary';
      case 'Recebido':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="h-full w-full relative">
        <Map issues={issues} />
      
      <div className="absolute top-4 left-4 z-10 w-80 space-y-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200">
           <CardHeader>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari sesuatu..." className="pl-10 bg-white" />
              </div>
           </CardHeader>
           <CardContent>
             <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Label Wilayah</Label>
              </div>
           </CardContent>
        </Card>
      </div>

       <div className="absolute bottom-4 right-4 z-10 space-y-2">
           <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200 p-2">
                <Button variant="ghost" size="icon">
                    <Layers />
                </Button>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200 p-2">
                <Button variant="ghost" size="icon">
                   <ArrowRight />
                </Button>
            </Card>
       </div>
    </div>
  );
};

export default InteractiveMap;
