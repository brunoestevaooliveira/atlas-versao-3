'use client';

import { issues } from '@/lib/data';
import { Card, CardContent, CardHeader } from './ui/card';
import { Layers, Search } from 'lucide-react';
import { Button } from './ui/button';
import dynamic from 'next/dynamic';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const Map = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
});

const InteractiveMap = () => {
  return (
    <div className="absolute inset-0">
      <Map issues={issues} />
      
      <div className="absolute top-20 left-4 z-10 w-80 space-y-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200">
           <CardHeader>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-10 bg-white" />
              </div>
           </CardHeader>
           <CardContent>
             <div className="flex items-center space-x-2">
                <Switch id="layers-switch" />
                <Label htmlFor="layers-switch">Mostrar Camadas</Label>
              </div>
           </CardContent>
        </Card>
      </div>

       <div className="absolute bottom-4 right-4 z-10 space-y-2">
           <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200 p-2 rounded-lg">
                <Button variant="ghost" size="icon">
                    <Layers />
                </Button>
            </Card>
       </div>
    </div>
  );
};

export default InteractiveMap;
