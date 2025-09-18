
'use client';

import type { Issue } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo, forwardRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, MapLayerMouseEvent, MapRef } from 'react-map-gl';
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
  mapRef?: React.RefObject<MapRef>;
  mapStyle: 'streets' | 'satellite';
}

const MapComponent = forwardRef<MapRef, MapProps>(({ issues, center, mapStyle }, ref) => {
  const router = useRouter();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const { theme } = useTheme();
  
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newReportInfo, setNewReportInfo] = useState<NewReportInfo | null>(null);

  const getMapStyle = () => {
    if (mapStyle === 'satellite') {
      return "mapbox://styles/mapbox/satellite-streets-v12";
    }
    return theme === 'dark' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12";
  }

  const formatAddress = (feature: any) => {
    let placeName = feature.place_name || '';
    
    // Remove "Edf " do começo e substitui "Quadra Residencial" por "Qr"
    placeName = placeName.replace(/^Edf\s+/i, '').replace(/Quadra Residencial/gi, 'Qr');

    // Remove o CEP e o país do final para uma exibição mais limpa.
    return placeName.replace(/, \d{5}-\d{3}, Brazil$/, '').replace(/, Brazil$/, '');
  };

  const fetchAddress = async (lat: number, lng: number) => {
    if (!mapboxToken) {
        console.error("Mapbox token is not configured.");
        return "Endereço não disponível";
    }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address,poi&limit=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return formatAddress(data.features[0]);
      }
      return 'Endereço não encontrado';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Erro ao buscar endereço';
    }
  };

  const handleMapClick = async (e: MapLayerMouseEvent) => {
    // Ignora cliques nos marcadores existentes
    if (e.originalEvent?.target && (e.originalEvent.target as HTMLElement).closest('.mapboxgl-marker')) return;
    
    const { lng, lat } = e.lngLat;
    
    setSelectedIssue(null); // Fecha popup de ocorrência existente
    setNewReportInfo({ lat, lng, address: '', isLoading: true });

    const fetchedAddress = await fetchAddress(lat, lng);
    setNewReportInfo({ lat, lng, address: fetchedAddress, isLoading: false });
  };

  const handleConfirmLocation = () => {
    if (newReportInfo) {
      const { lat, lng, address } = newReportInfo;
      // Passa os dados para a página de report
      router.push(`/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
    }
    setNewReportInfo(null); // Fecha o popup
  };

  const issueMarkers = useMemo(() => issues.map(issue => (
    <Marker 
        key={issue.id}
        longitude={issue.location.lng} 
        latitude={issue.location.lat}
        anchor="bottom"
        onClick={e => {
            e.originalEvent.stopPropagation();
            setNewReportInfo(null);
            setSelectedIssue(issue);
        }}
    >
        <MapPin className="text-primary h-8 w-8 cursor-pointer" fill="currentColor"/>
    </Marker>
  )), [issues]);

  return (
    <>
      <Map
        ref={ref}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 13,
          pitch: 0
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapStyle()}
        key={`${theme}-${mapStyle}`} // Força a recriação do mapa ao mudar tema ou estilo
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

        {/* Marcador para a nova ocorrência */}
        {newReportInfo && (
          <Marker
            longitude={newReportInfo.lng}
            latitude={newReportInfo.lat}
            anchor="bottom"
          >
            <MapPin className="text-primary h-8 w-8" fill="currentColor"/>
          </Marker>
        )}
        {/* Popup para confirmar a nova ocorrência */}
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
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            <span className="text-sm text-muted-foreground">Buscando endereço...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-foreground">
                                {newReportInfo.address}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Lat: {newReportInfo.lat.toFixed(5)}, Lng: {newReportInfo.lng.toFixed(5)}
                            </p>
                          </>
                        )}
                    </div>
                    <Button 
                        onClick={handleConfirmLocation} 
                        className="w-full"
                        disabled={newReportInfo.isLoading}
                    >
                        Confirmar e Reportar
                    </Button>
                </div>
            </Popup>
        )}
      </Map>
    </>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
