
'use client';

import type { Issue } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, MapLayerMouseEvent, MapRef } from 'react-map-gl';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NewReportInfo {
  lat: number;
  lng: number;
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
      // Usando um mapa de satélite que inclui ruas e rótulos para melhor contexto
      return "mapbox://styles/mapbox/satellite-streets-v12";
    }
    // O tema escuro do Mapbox (dark-v11) tem melhor contraste que o light-v11
    return theme === 'dark' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12";
  }


  const handleMapClick = (e: MapLayerMouseEvent) => {
    // Prevent click when clicking on an existing marker
    if (e.originalEvent?.target && (e.originalEvent.target as HTMLElement).closest('.mapboxgl-marker')) return;
    
    const { lng, lat } = e.lngLat;
    
    // Clear any selected issue to hide its popup
    setSelectedIssue(null);
    
    // Set initial state for the new report pin, without fetching address
    setNewReportInfo({ lat, lng });
  };

  const handleConfirmLocation = () => {
    if (newReportInfo) {
      const { lat, lng } = newReportInfo;
      // Passa apenas as coordenadas, o usuário preencherá o endereço
      router.push(`/report?lat=${lat}&lng=${lng}`);
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
                        <p className="text-sm text-foreground">
                            Lat: {newReportInfo.lat.toFixed(6)}, Lng: {newReportInfo.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Você preencherá o endereço na próxima etapa.</p>
                    </div>
                    <Button 
                        onClick={handleConfirmLocation} 
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
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
