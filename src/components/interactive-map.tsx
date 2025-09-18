
'use client';

import { forwardRef } from 'react';
import type { Issue } from '@/lib/types';
import Map from '@/components/map';
import { MapRef } from 'react-map-gl';

interface InteractiveMapProps {
  issues: Issue[];
  mapStyle: 'streets' | 'satellite';
}

const InteractiveMap = forwardRef<MapRef, InteractiveMapProps>(({ issues, mapStyle }, ref) => {
  const center = { lat: -16.0036, lng: -47.9872 };

  return (
    <div className="absolute inset-0 z-0">
      <Map issues={issues} center={center} mapStyle={mapStyle} ref={ref} />
    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
