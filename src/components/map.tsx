
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
import { Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';


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

const formatAddress = (addressData: any): string => {
    if (!addressData) return 'Endereço não encontrado';
    const { road, suburb, city_district, city, postcode } = addressData;
    const parts = [road, suburb, city_district, city].filter(Boolean); // Filtra partes nulas ou vazias
    const address = parts.join(', ');
    return postcode ? `${address} - CEP: ${postcode}` : address;
}

const Map: React.FC<MapProps> = ({ issues, center }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleSelectLocation = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setDialogOpen(true);

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const address = formatAddress(data.address) || 'Endereço não encontrado';
        setGeocodingResult({ address, lat, lng });
    } catch (error) {
        console.error("Erro na geocodificação reversa:", error);
        setGeocodingResult({ address: 'Erro ao buscar endereço', lat, lng });
    } finally {
        setIsGeocoding(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
        const map = L.map(mapContainerRef.current, {
            center: center,
            zoom: 14,
        });

        mapRef.current = map;

        // This removes default popup styling by replacing the pane content
        const popupPane = map.getPane('popupPane');
        if (popupPane) {
            popupPane.innerHTML = '';
        }
        
        L.tileLayer('https://c.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            
            if (tempMarkerRef.current) {
                tempMarkerRef.current.remove();
            }

            const tempMarker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
            tempMarker.bindPopup('Buscando endereço...').openPopup();
            tempMarkerRef.current = tempMarker;

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();
                const address = formatAddress(data.address);
                
                const popupContent = `
                    <div style="font-family: 'PT Sans', sans-serif; background-color: hsl(var(--card)); color: hsl(var(--card-foreground)); padding: 12px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); border: 1px solid hsl(var(--border) / 0.5); width: 250px;">
                        <p style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">Local selecionado</p>
                        <p style="font-size: 13px; color: hsl(var(--muted-foreground)); margin: 0 0 12px 0; line-height: 1.4;">${address}</p>
                        <hr style="margin: 12px 0; border: 0; border-top: 1px solid hsl(var(--border));">
                        <button id="select-location-btn" 
                                style="width: 100%; text-align: center; padding: 10px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: background-color 0.2s;
                                       background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border: none;">
                            Reportar neste Local
                        </button>
                    </div>
                `;
                tempMarker.getPopup()?.setContent(popupContent);
                
                const selectBtn = document.getElementById('select-location-btn');
                if (selectBtn) {
                    selectBtn.onclick = () => handleSelectLocation(lat, lng);
                }

            } catch (error) {
                console.error("Erro na geocodificação reversa:", error);
                tempMarker.getPopup()?.setContent('Erro ao buscar endereço.');
            }
        });
    }
  }, []);

  // Update issue markers when issues change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing issue markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new issue markers
    issues.forEach(issue => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${issue.location.lat},${issue.location.lng}`;
        const marker = L.marker([issue.location.lat, issue.location.lng], { icon: defaultIcon })
            .addTo(map)
            .bindPopup(`
                <div style="font-family: 'PT Sans', sans-serif; background-color: hsl(var(--card)); color: hsl(var(--card-foreground)); padding: 12px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); border: 1px solid hsl(var(--border) / 0.5); width: 250px;">
                    <p style="font-weight: 700; font-size: 16px; margin: 0 0 4px 0;">${issue.title}</p>
                    <p style="font-size: 13px; color: hsl(var(--primary)); margin: 0 0 8px 0; font-weight: 500;">${issue.category}</p>
                    <p style="font-size: 13px; color: hsl(var(--muted-foreground)); margin: 0 0 12px 0;">${issue.status}</p>
                     <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer"
                        style="display: inline-block; text-decoration: none; width: 100%; text-align: center; padding: 8px 14px; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: background-color 0.2s;
                               background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); border: 1px solid hsl(var(--border));">
                        Ver no Google Maps
                     </a>
                </div>
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
      <div ref={mapContainerRef} className="h-full w-full cursor-crosshair"></div>
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
