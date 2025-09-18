
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
  address: string;
  isLoading: boolean;
}

interface MapProps {
  issues: Issue[];
  center: { lat: number; lng: number };
  mapRef?: React.RefObject<MapRef>;
  mapStyle: 'streets' | 'satellite';
}

// Rewritten to parse Mapbox Geocoding API response
const formatAddress = (features: any[]): string => {
    if (!features || features.length === 0) return 'Endereço não encontrado';
    
    const feature = features[0]; // Use the most relevant result
    const placeName = feature.place_name; // e.g., "QR 100 Conjunto 1, 2, Santa Maria, Brasília, Distrito Federal 72540-101, Brazil"
    const address = feature.address; // e.g., "72540-101"
    const text = feature.text; // e.g., "QR 100 Conjunto 1, 2"
    const place = feature.place; // e.g., "Santa Maria"
    const district = feature.context?.find((c: any) => c.id.startsWith('district'))?.text;
    const postcode = feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text;
    const city = feature.context?.find((c: any) => c.id.startsWith('place'))?.text;
    const state = feature.context?.find((c: any) => c.id.startsWith('region'))?.text;

    // A resposta do Mapbox costuma ser bem completa no `place_name`.
    // Vamos apenas remover a parte do país para ficar mais limpo.
    if (placeName) {
        return placeName.replace(', Brazil', '').replace(', Brasil', '');
    }

    // Fallback se o place_name não for o ideal
    let constructedAddress = text || '';
    if (district && constructedAddress !== district) {
        constructedAddress += `, ${district}`;
    }
    if (city && !constructedAddress.includes(city)) {
        constructedAddress += ` - ${city}`;
    }
     if (postcode) {
        constructedAddress += `, CEP: ${postcode}`;
    }

    return constructedAddress || 'Endereço não pode ser determinado';
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


  const handleMapClick = async (e: MapLayerMouseEvent) => {
    // Prevent click when clicking on an existing marker
    if (e.originalEvent?.target && (e.originalEvent.target as HTMLElement).closest('.mapboxgl-marker')) return;
    
    const { lng, lat } = e.lngLat;
    
    // Clear any selected issue to hide its popup
    setSelectedIssue(null);
    
    // Set initial state for the new report pin
    setNewReportInfo({ lat, lng, address: '', isLoading: true });

    try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=pt-BR&types=address,poi,neighborhood,place`);
        const data = await response.json();
        const address = formatAddress(data.features) || 'Endereço não encontrado';
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
        key={`${theme}-${mapStyle}`}
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
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;

    
