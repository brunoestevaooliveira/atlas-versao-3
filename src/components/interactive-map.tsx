
'use client';

import type { Issue } from '@/lib/types';
import Map from '@/components/map';

interface InteractiveMapProps {
  issues: Issue[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ issues }) => {
  const center = { lat: -16.0036, lng: -47.9872 };

  return (
    <div className="absolute inset-0 z-0">
      <Map issues={issues} center={center} />
    </div>
  );
};

export default InteractiveMap;
