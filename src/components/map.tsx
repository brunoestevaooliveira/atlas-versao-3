/**
 * @file src/components/map.tsx
 * @fileoverview Componente principal que renderiza o mapa interativo usando Mapbox e react-map-gl.
 * Este componente é responsável por:
 * - Renderizar o mapa centrado em uma localização específica.
 * - Agrupar (cluster) ocorrências próximas em um único marcador para evitar poluição visual.
 * - Exibir marcadores (Markers) para cada ocorrência ou cluster.
 * - Mostrar um Pop-up com detalhes da ocorrência ao clicar em um marcador individual.
 * - Dar zoom no mapa ao clicar em um marcador de cluster.
 * - Permitir que o usuário clique em qualquer lugar no mapa para criar uma nova ocorrência.
 * - Obter o endereço correspondente às coordenadas clicadas usando a API de geocodificação do Mapbox.
 * - Exibir um diálogo de confirmação com o endereço antes de redirecionar para a página de reporte.
 */

'use client';

import type { Issue } from '@/lib/types';
import { useState, useMemo, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, MapLayerMouseEvent, MapRef } from 'react-map-gl';
import { Loader2, MapPin } from 'lucide-react';
import useSupercluster from 'use-supercluster';
import type { PointFeature } from 'supercluster';
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
  
  // Estado para o diálogo de confirmação de endereço
  const [confirmationData, setConfirmationData] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Estado para armazenar o zoom e os limites (bounds) atuais do mapa.
  const [zoom, setZoom] = useState(13);
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>();

  // Converte as 'issues' para o formato GeoJSON que o `useSupercluster` pode entender.
  const points: PointFeature<{ cluster: false; issue: Issue }>[] = useMemo(() => issues.map(issue => ({
      type: 'Feature',
      properties: {
        cluster: false,
        issue: issue,
      },
      geometry: {
        type: 'Point',
        coordinates: [issue.location.lng, issue.location.lat],
      },
  })), [issues]);

  // Hook `useSupercluster` para calcular os clusters.
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });


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
      
      // Define os dados para o modal de confirmação.
      setConfirmationData({ lat, lng, address });

    } catch (error) {
      console.error("Erro na geocodificação:", error);
      // Se a geocodificação falhar, redireciona apenas com as coordenadas.
      router.push(`/report?lat=${lat}&lng=${lng}&address=Endereço não encontrado`);
    } finally {
      setGeocoding(false);
    }
  };

  /**
   * Redireciona o usuário para a página de relatório após a confirmação.
   */
  const handleConfirmLocation = () => {
    if (!confirmationData) return;
    const { lat, lng, address } = confirmationData;
    router.push(`/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
    setConfirmationData(null);
  };


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
        onZoom={(e) => setZoom(e.viewState.zoom)}
        onMove={(e) => {
            setZoom(e.viewState.zoom);
            setBounds(e.target.getBounds().toArray().flat() as [number, number, number, number]);
        }}
        cursor={geocoding ? 'wait' : 'pointer'}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        {/* Renderiza os clusters e marcadores individuais */}
        {clusters.map(cluster => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count } = cluster.properties;

            // Se for um cluster (agrupamento de pontos)
            if (isCluster) {
                return (
                    <Marker key={`cluster-${cluster.id}`} latitude={latitude} longitude={longitude}>
                        <div
                            className="w-8 h-8 bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm cursor-pointer border-2 border-white/50 shadow-md hover:scale-110 transition-transform"
                            onClick={(e) => {
                                e.stopPropagation();
                                const expansionZoom = Math.min(
                                    supercluster?.getClusterExpansionZoom(cluster.id as number),
                                    20
                                );
                                const map = (ref as React.RefObject<MapRef>)?.current;
                                map?.flyTo({
                                    center: [longitude, latitude],
                                    zoom: expansionZoom,
                                    speed: 1.5,
                                });
                            }}
                        >
                            {point_count}
                        </div>
                    </Marker>
                );
            }

            // Se for um marcador individual
            const issue = cluster.properties.issue;
            return (
                <Marker
                    key={`issue-${issue.id}`}
                    latitude={latitude}
                    longitude={longitude}
                >
                    <button onClick={(e) => {
                        e.stopPropagation();
                        setPopupInfo(issue);
                    }} className="transform hover:scale-125 transition-transform duration-200 ease-in-out">
                        <MapPin className="h-8 w-8 text-primary fill-current drop-shadow-lg" />
                    </button>
                </Marker>
            );
        })}


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

      {/* Diálogo de Confirmação de Endereço */}
      <AlertDialog open={confirmationData !== null} onOpenChange={(open) => !open && setConfirmationData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Localização</AlertDialogTitle>
            <AlertDialogDescription>
              Você selecionou o seguinte endereço. Deseja criar uma ocorrência para este local?
              <p className="font-semibold text-foreground mt-2 bg-muted p-2 rounded-md">
                {confirmationData?.address}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationData(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLocation}>
              Confirmar Local
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
