

'use client';

import { useState, useEffect } from 'react';
import type { Issue } from '@/lib/types';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" />
});

interface InteractiveMapProps {
  issues: Issue[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ issues }) => {
  const [isMounted, setIsMounted] = useState(false);
  const center: [number, number] = [-16.0036, -47.9872];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {isMounted && <Map issues={issues} center={center} />}
    </div>
  );
};

export default InteractiveMap;
