/**
 * @file src/components/map.tsx
 * @fileoverview Componente principal que renderiza o mapa interativo usando Mapbox e react-map-gl.
 * Este componente é responsável por:
 * - Renderizar o mapa centrado em uma localização específica.
 * - Exibir marcadores (Markers) para cada ocorrência recebida.
 * - Mostrar um Pop-up com detalhes da ocorrência ao clicar em um marcador.
 * - Permitir que o usuário clique em qualquer lugar no mapa para criar uma nova ocorrência.
 * - Obter o endereço correspondente às coordenadas clicadas usando a API de geocodificação do Mapbox.
 * - Redirecionar o usuário para a página de relatório com as coordenadas e o endereço na URL.
 */

'use client';

import type { Issue } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, MapLayerMouseEvent, MapRef } from 'react-map-gl';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';


interface MapComponentProps {
  /** A lista de ocorrências a serem exibidas no mapa. */
  issues: Issue[];
  /** As coordenadas para centralizar o mapa inicialmente. */
  center: { lat: number; lng: number };
   /** O estilo visual do mapa (ruas ou satélite). */
  mapStyle: 'streets' | 'satellite';
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Componente do Mapa. Utiliza `forwardRef` para passar a referência do mapa para o componente pai.
 */
const MapComponent = forwardRef<MapRef, MapComponentProps>(({ issues, center, mapStyle }, ref) => {
  const router = useRouter();
  const [popupInfo, setPopupInfo] = useState<Issue | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  /**
   * Manipula o clique em qualquer lugar no mapa.
   * Obtém as coordenadas e busca o endereço correspondente.
   * @param {MapLayerMouseEvent} event O evento de clique do mapa.
   */
  const handleMapClick = async (event: MapLayerMouseEvent) => {
    // Impede a criação de um novo ponto se um pop-up já estiver aberto.
    if (popupInfo) return;

    setGeocoding(true);
    const { lng, lat } = event.lngLat;

    try {
      // Busca o endereço usando a API de geocodificação reversa do Mapbox.
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      // Usa o primeiro resultado retornado pela API.
      const address = data.features[0]?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      
      // Redireciona para a página de relatório com os dados na URL.
      router.push(`/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);

    } catch (error) {
      console.error("Erro na geocodificação:", error);
      // Se a geocodificação falhar, redireciona apenas com as coordenadas.
      router.push(`/report?lat=${lat}&lng=${lng}&address=Endereço não encontrado`);
    } finally {
      setGeocoding(false);
    }
  };

  /**
   * Gera a lista de marcadores (Markers) para cada ocorrência.
   * `useMemo` otimiza a performance, recriando os marcadores apenas se a lista de 'issues' mudar.
   */
  const markers = useMemo(() => issues.map(issue => (
    <Marker key={issue.id} longitude={issue.location.lng} latitude={issue.location.lat}>
      <button onClick={(e) => {
        e.stopPropagation();
        setPopupInfo(issue);
      }} className="transform hover:scale-125 transition-transform duration-200 ease-in-out">
        <MapPin className="h-8 w-8 text-primary fill-current drop-shadow-lg" />
      </button>
    </Marker>
  )), [issues]);

  const mapStyleUrl = mapStyle === 'satellite' 
    ? 'mapbox://styles/mapbox/satellite-streets-v12' 
    : 'mapbox://styles/mapbox/streets-v12';

  // Alerta de segurança se o token do Mapbox não estiver configurado.
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-red-100 text-red-800">
        Erro: A variável de ambiente NEXT_PUBLIC_MAPBOX_TOKEN não está configurada.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={ref}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 13,
          pitch: 0,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyleUrl}
        onClick={handleMapClick}
        cursor={geocoding ? 'wait' : 'pointer'}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        {markers}

        {popupInfo && (
          <Popup
            longitude={popupInfo.location.lng}
            latitude={popupInfo.location.lat}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            anchor="left"
            offset={20}
          >
            <div className="p-1 max-w-xs">
              <h3 className="font-bold text-base text-foreground">{popupInfo.title}</h3>
              <p className="text-primary text-sm font-semibold">{popupInfo.category}</p>
              <p className="text-muted-foreground text-xs mt-1">{popupInfo.address}</p>
            </div>
          </Popup>
        )}
      </Map>
      {geocoding && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
