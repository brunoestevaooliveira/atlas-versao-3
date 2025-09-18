/**
 * @file src/components/map.tsx
 * @fileoverview Componente principal que renderiza o mapa usando `react-map-gl`.
 * Ele é responsável por exibir os marcadores de ocorrências, os pop-ups e
 * por manipular os cliques do usuário no mapa para criar novas ocorrências.
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
import { useTheme } from 'next-themes';

/**
 * Interface para o estado de um novo relatório sendo criado.
 */
interface NewReportInfo {
  lat: number;
  lng: number;
  address: string;
  isLoading: boolean;
}

interface MapProps {
  issues: Issue[];
  center: { lat: number; lng: number };
  mapStyle: 'streets' | 'satellite';
}

/**
 * Componente que renderiza o mapa e toda a sua lógica interativa.
 * @param {MapProps} props As propriedades do componente.
 * @param {React.Ref<MapRef>} ref A referência para o objeto do mapa, vinda do componente pai.
 */
const MapComponent = forwardRef<MapRef, MapProps>(({ issues, center, mapStyle }, ref) => {
  const router = useRouter();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const { theme } = useTheme();
  
  // Estado para a ocorrência selecionada (para exibir o pop-up).
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  // Estado para a nova ocorrência que o usuário está criando ao clicar no mapa.
  const [newReportInfo, setNewReportInfo] = useState<NewReportInfo | null>(null);

  /**
   * Determina qual URL de estilo do Mapbox usar com base no tema (claro/escuro) e na seleção do usuário (rua/satélite).
   * @returns {string} A URL do estilo do mapa.
   */
  const getMapStyle = () => {
    if (mapStyle === 'satellite') {
      return "mapbox://styles/mapbox/satellite-streets-v12";
    }
    return theme === 'dark' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12";
  }

  /**
   * Formata a resposta da API de geocodificação para um endereço mais legível.
   * Remove "Edf" e substitui "Quadra Residencial" por "Qr".
   * @param feature O objeto 'feature' retornado pela API do Mapbox.
   * @returns {string} O endereço formatado.
   */
  const formatAddress = (feature: any) => {
    let placeName = feature.place_name || '';
    
    // Remove "Edf " do começo e substitui "Quadra Residencial" por "Qr"
    placeName = placeName.replace(/^Edf\s+/i, '').replace(/Quadra Residencial/gi, 'Qr');

    // Remove o CEP e o país do final para uma exibição mais limpa.
    return placeName.replace(/, \d{5}-\d{3}, Brazil$/, '').replace(/, Brazil$/, '');
  };

  /**
   * Busca o endereço textual correspondente a um par de coordenadas (latitude, longitude).
   * Usa a API de Geocodificação Reversa do Mapbox.
   * @param {number} lat Latitude.
   * @param {number} lng Longitude.
   * @returns {Promise<string>} O endereço formatado.
   */
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    if (!mapboxToken) {
        console.error("Token do Mapbox não configurado.");
        return "Endereço não disponível";
    }
    // A query `types=address,poi` prioriza resultados de endereços e pontos de interesse.
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address,poi&limit=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return formatAddress(data.features[0]);
      }
      return 'Endereço não encontrado';
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      return 'Erro ao buscar endereço';
    }
  };

  /**
   * Manipulador de evento para o clique no mapa.
   * Inicia o processo de criação de uma nova ocorrência, buscando o endereço do local clicado.
   * @param {MapLayerMouseEvent} e O evento de clique do mapa.
   */
  const handleMapClick = async (e: MapLayerMouseEvent) => {
    // Ignora cliques nos marcadores existentes para não abrir dois pop-ups.
    if (e.originalEvent?.target && (e.originalEvent.target as HTMLElement).closest('.mapboxgl-marker')) return;
    
    const { lng, lat } = e.lngLat;
    
    setSelectedIssue(null); // Fecha o pop-up de uma ocorrência existente, se houver.
    // Define o estado inicial para o novo relatório, com o endereço carregando.
    setNewReportInfo({ lat, lng, address: '', isLoading: true });

    // Busca o endereço e atualiza o estado quando a busca terminar.
    const fetchedAddress = await fetchAddress(lat, lng);
    setNewReportInfo({ lat, lng, address: fetchedAddress, isLoading: false });
  };

  /**
   * Manipulador de evento para o botão "Confirmar e Reportar".
   * Redireciona o usuário para a página de relatório, passando as coordenadas e o endereço via URL.
   */
  const handleConfirmLocation = () => {
    if (newReportInfo) {
      const { lat, lng, address } = newReportInfo;
      // Navega para a página de report, passando os dados como query params.
      router.push(`/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
    }
    setNewReportInfo(null); // Fecha o pop-up.
  };

  // Memoiza a criação dos marcadores de ocorrências para otimização.
  // Os marcadores só são recriados se a lista de 'issues' mudar.
  const issueMarkers = useMemo(() => issues.map(issue => (
    <Marker 
        key={issue.id}
        longitude={issue.location.lng} 
        latitude={issue.location.lat}
        anchor="bottom"
        onClick={e => {
            // Impede que o clique no marcador propague para o mapa e abra o pop-up de "nova ocorrência".
            e.originalEvent.stopPropagation();
            setNewReportInfo(null); // Fecha o pop-up de nova ocorrência.
            setSelectedIssue(issue); // Abre o pop-up da ocorrência clicada.
        }}
    >
        <MapPin className="text-primary h-8 w-8 cursor-pointer" fill="currentColor"/>
    </Marker>
  )), [issues]);

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <>
      <Map
        ref={ref} // Passa a ref para o componente Map do Mapbox.
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 13,
          pitch: 0
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapStyle()}
        // A chave `key` força a recriação do mapa quando o tema ou estilo muda, garantindo a atualização visual.
        key={`${theme}-${mapStyle}`} 
        onClick={handleMapClick}
        interactiveLayerIds={['clusters']}
      >
        {/* Controles de navegação e geolocalização do mapa. */}
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        {/* Renderiza os marcadores de ocorrências. */}
        {issueMarkers}

        {/* Pop-up para a ocorrência selecionada. */}
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

        {/* Marcador para a nova ocorrência que está sendo criada. */}
        {newReportInfo && (
          <Marker
            longitude={newReportInfo.lng}
            latitude={newReportInfo.lat}
            anchor="bottom"
          >
            <MapPin className="text-primary h-8 w-8" fill="currentColor"/>
          </Marker>
        )}

        {/* Pop-up para confirmar a localização da nova ocorrência. */}
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
