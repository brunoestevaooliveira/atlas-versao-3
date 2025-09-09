
'use client';

import type { Issue } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

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
  center: [number, number];
}

interface GeocodingResult {
  address: string;
  lat: number;
  lng: number;
}

const Map: React.FC<MapProps> = ({ issues, center }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

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

        map.on('dblclick', async (e) => {
          const { lat, lng } = e.latlng;
          setIsGeocoding(true);
          setDialogOpen(true);

          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const address = data.display_name || 'Endereço não encontrado';
            setGeocodingResult({ address, lat, lng });
          } catch (error) {
            console.error("Erro na geocodificação reversa:", error);
            setGeocodingResult({ address: 'Erro ao buscar endereço', lat, lng });
          } finally {
            setIsGeocoding(false);
          }
        });
    }
  }, [center]);

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

  const handleConfirmLocation = () => {
    if (geocodingResult) {
      const { lat, lng, address } = geocodingResult;
      router.push(`/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setGeocodingResult(null);
  }

  return (
    <>
      <div ref={mapContainerRef} className="h-full w-full"></div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Localização</AlertDialogTitle>
             <AlertDialogDescription>
                Você selecionou o seguinte local para reportar uma ocorrência. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 p-4 border rounded-md bg-muted/50">
            {isGeocoding ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Buscando endereço...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground">{geocodingResult?.address}</p>
            )}
          </div>
         
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLocation} disabled={isGeocoding}>
              Confirmar e Reportar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Map;
