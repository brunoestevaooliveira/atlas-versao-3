
'use client';

import type { Issue } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, MapLayerMouseEvent } from 'react-map-gl';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NewReportInfo {
  lat: number;
  lng: number;
  address: string;
  isLoading: boolean;
}

interface MapProps {
  issues: Issue[];
  center: { lat: number; lng: number };
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
  const [newReportInfo, setNewReportInfo] = useState<NewReportInfo | null>(null);


  const handleMapClick = async (e: MapLayerMouseEvent) => {
    // Prevent click when clicking on an existing marker
    if (e.originalEvent.target.closest('.mapboxgl-marker')) return;
    
    const { lng, lat } = e.lngLat;
    
    // Clear any selected issue to hide its popup
    setSelectedIssue(null);
    
    // Set initial state for the new report pin
    setNewReportInfo({ lat, lng, address: '', isLoading: true });

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const address = formatAddress(data.address) || 'Endereço não encontrado';
        setNewReportInfo({ lat, lng, address, isLoading: false });
    } catch (error) {
        console.error("Erro na geocodificação reversa:", error);
        setNewReportInfo({ lat, lng, address: 'Erro ao buscar endereço', isLoading: false });
    }
  };

  const handleConfirmLocation = () => {
    if (newReportInfo) {
      const { lat, lng, address } = newReportInfo;
      router.push(`/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
    }
    setNewReportInfo(null);
  };

  const issueMarkers = useMemo(() => issues.map(issue => (
    <Marker 
        key={issue.id}
        longitude={issue.location.lng} 
        latitude={issue.location.lat}
        anchor="bottom"
        onClick={e => {
            e.originalEvent.stopPropagation();
            setNewReportInfo(null); // Close new report popup if open
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
        interactiveLayerIds={['clusters']}
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
                className="font-sans z-10"
            >
                <div className="space-y-2 p-1">
                    <h3 className="font-bold text-base">{selectedIssue.title}</h3>
                    <p className="text-sm text-primary">{selectedIssue.category}</p>
                    <p className="text-xs text-muted-foreground">{selectedIssue.status}</p>
                </div>
            </Popup>
        )}

        {newReportInfo && (
          <Marker
            longitude={newReportInfo.lng}
            latitude={newReportInfo.lat}
            anchor="bottom"
          >
            <MapPin className="text-primary h-8 w-8" fill="currentColor"/>
          </Marker>
        )}
        {newReportInfo && (
            <Popup
                anchor="bottom"
                longitude={newReportInfo.lng}
                latitude={newReportInfo.lat}
                onClose={() => setNewReportInfo(null)}
                closeOnClick={false}
                offset={-15}
                className="font-sans z-20"
            >
               <div className="space-y-3 p-1 max-w-xs">
                    <h3 className="font-bold text-base">Confirmar Localização</h3>
                     <div className="p-2 border rounded-md bg-muted/50">
                        {newReportInfo.isLoading ? (
                            <div className="flex items-center gap-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Buscando endereço...</span>
                            </div>
                        ) : (
                            <p className="text-sm text-foreground">{newReportInfo.address}</p>
                        )}
                    </div>
                    <Button 
                        onClick={handleConfirmLocation} 
                        disabled={newReportInfo.isLoading}
                        className="w-full"
                    >
                        Confirmar e Reportar
                    </Button>
                </div>
            </Popup>
        )}

      </Map>
    </>
  );
};

export default MapComponent;
