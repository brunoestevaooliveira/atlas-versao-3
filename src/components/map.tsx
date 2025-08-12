'use client';

import type { Issue } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const center: [number, number] = [-16.0036, -47.9872];
  const router = useRouter();

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
        const map = L.map(mapContainerRef.current, {
            center: center,
            zoom: 14,
        });
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          router.push(`/report?lat=${lat}&lng=${lng}`);
        });
    }
  }, [center, router]);

  // Update markers when issues change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    issues.forEach(issue => {
        const marker = L.marker([issue.location.lat, issue.location.lng], { icon: defaultIcon })
            .addTo(map)
            .bindPopup(`
                <div class="font-bold">${issue.title}</div>
                <div>${issue.category}</div>
                <div class="text-sm text-muted-foreground">${issue.status}</div>
            `);
        markersRef.current.push(marker);
    });
    
  }, [issues]);

  return (
    <div ref={mapContainerRef} className="h-full w-full"></div>
  );
};

export default Map;
