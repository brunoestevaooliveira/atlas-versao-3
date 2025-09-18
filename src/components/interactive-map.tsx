
'use client';

import type { Issue } from '@/lib/types';
import Map from '@/components/map';
import { MapRef } from 'react-map-gl';

interface InteractiveMapProps {
  issues: Issue[];
  mapRef?: React.RefObject<MapRef>;
  mapStyle: 'streets' | 'satellite';
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ issues, mapRef, mapStyle }) => {
  const center = { lat: -16.0036, lng: -47.9872 };

  return (
    <div className="absolute inset-0 z-0">
      <Map issues={issues} center={center} mapRef={mapRef} mapStyle={mapStyle} />
    </div>
  );
};

export default InteractiveMap;

    
