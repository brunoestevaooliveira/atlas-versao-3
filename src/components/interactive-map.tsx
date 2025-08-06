
'use client';

import { issues } from '@/lib/data';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
});

const InteractiveMap = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Map issues={issues} />
    </div>
  );
};

export default InteractiveMap;
