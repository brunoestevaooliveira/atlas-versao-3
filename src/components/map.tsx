
'use client';

import type { Issue } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

// Leaflet's default icons are not easily available in this environment, so we create a custom one.
const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
  issues: Issue[];
}

const Map: React.FC<MapProps> = ({ issues }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const center: [number, number] = [-15.9839, -48.0253]; // Corrected center for Santa Maria, DF

  useEffect(() => {
    // Initialize map only if the container ref is available and no map is initialized
    if (mapContainerRef.current && !mapRef.current) {
        const map = L.map(mapContainerRef.current).setView(center, 14);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        issues.forEach(issue => {
            L.marker([issue.location.lat, issue.location.lng], { icon: defaultIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="font-bold">${issue.title}</div>
                    <div>${issue.category}</div>
                    <div class="text-sm text-muted-foreground">${issue.status}</div>
                `);
        });
    }

    // Cleanup function to run when component unmounts
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, [issues, center]); // Rerun effect if issues or center change

  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
  );
};

export default Map;
