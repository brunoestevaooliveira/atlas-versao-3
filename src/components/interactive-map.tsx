/**
 * @file src/components/interactive-map.tsx
 * @fileoverview Componente wrapper que encapsula o mapa principal.
 * Ele recebe as ocorrências e o estilo do mapa, e os repassa para o componente de mapa real.
 * Utiliza forwardRef para permitir que o componente pai controle a câmera do mapa.
 */

'use client';

import { forwardRef } from 'react';
import type { Issue } from '@/lib/types';
import Map from '@/components/map';
import { MapRef } from 'react-map-gl';

interface InteractiveMapProps {
  /** A lista de ocorrências a serem exibidas no mapa. */
  issues: Issue[];
  /** O estilo visual do mapa (ruas ou satélite). */
  mapStyle: 'streets' | 'satellite';
}

/**
 * Encapsula o componente de mapa, agindo como uma ponte entre a página principal
 * e a implementação do `react-map-gl`.
 * @param {InteractiveMapProps} props As propriedades do componente.
 * @param {React.Ref<MapRef>} ref A referência para o objeto do mapa, permitindo controle externo.
 */
const InteractiveMap = forwardRef<MapRef, InteractiveMapProps>(({ issues, mapStyle }, ref) => {
  // Coordenadas centrais padrão para o mapa (Santa Maria-DF).
  const center = { lat: -16.0036, lng: -47.9872 };

  return (
    <div className="absolute inset-0 z-0">
      <Map issues={issues} center={center} mapStyle={mapStyle} ref={ref} />
    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
