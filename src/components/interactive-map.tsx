
'use client';

import type { Issue } from '@/lib/types';
import Map from '@/components/map';
import { MapRef } from 'react-map-gl';

interface InteractiveMapProps {
  issues: Issue[];
  mapRef?: React.RefObject<MapRef>;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ issues, mapRef }) => {
  const center = { lat: -16.0036, lng: -47.9872 };

  return (
    <div className="absolute inset-0 z-0">
      <Map issues={issues} center={center} mapRef={mapRef} />
    </div>
  );
};

export default InteractiveMap;

    