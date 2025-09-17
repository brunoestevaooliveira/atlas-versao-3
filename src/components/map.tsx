
'use client';

import type { Issue } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, MapLayerMouseEvent } from 'react-map-gl';
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
import { MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

interface MapProps {
  issues: Issue[];
  center: { lat: number; lng: number };
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

const MapComponent: React.FC<MapProps> = ({ issues, center }) => {
  const router = useRouter();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const { theme } = useTheme();
  
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleMapClick = async (e: MapLayerMouseEvent) => {
    const { lng, lat } = e.lngLat;
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
  };

  const issueMarkers = useMemo(() => issues.map(issue => (
    <Marker 
        key={issue.id}
        longitude={issue.location.lng} 
        latitude={issue.location.lat}
        anchor="bottom"
        onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedIssue(issue);
        }}
    >
        <MapPin className="text-primary h-8 w-8 cursor-pointer" fill="currentColor"/>
    </Marker>
  )), [issues]);

  return (
    <>
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 13,
          pitch: 45 // Initial 3D tilt
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={theme === 'dark' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v11"}
        onClick={handleMapClick}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        {issueMarkers}

        {selectedIssue && (
            <Popup
                anchor="top"
                longitude={selectedIssue.location.lng}
                latitude={selectedIssue.location.lat}
                onClose={() => setSelectedIssue(null)}
                closeOnClick={false}
                className="font-sans"
            >
                <div className="space-y-2 p-1">
                    <h3 className="font-bold text-base">{selectedIssue.title}</h3>
                    <p className="text-sm text-primary">{selectedIssue.category}</p>
                    <p className="text-xs text-muted-foreground">{selectedIssue.status}</p>
                </div>
            </Popup>
        )}
      </Map>

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
            <AlertDialogCancel onClick={handleCancel}>Cancelar</Cancel>
            <AlertDialogAction onClick={handleConfirmLocation} disabled={isGeocoding}>
              Confirmar e Reportar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MapComponent;
