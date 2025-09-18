/**
 * @file src/components/interactive-map.tsx
 * @fileoverview Componente wrapper que encapsula o mapa principal.
 * Ele serve como uma ponte, recebendo as ocorrências e o estilo do mapa da página principal
 * e repassando-os para o componente de mapa real (`Map`). O uso de `forwardRef` é crucial
 * para permitir que o componente pai (a página) controle diretamente a câmera do mapa (zoom, pitch, etc.).
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
 * @param {React.Ref<MapRef>} ref A referência para o objeto do mapa, permitindo controle externo da câmera.
 */
const InteractiveMap = forwardRef<MapRef, InteractiveMapProps>(({ issues, mapStyle }, ref) => {
  // Coordenadas centrais padrão para o mapa (Santa Maria-DF).
  const center = { lat: -16.0036, lng: -47.9872 };

  return (
    <div className="absolute inset-0 z-0">
      {/* Repassa as propriedades e a referência para o componente de mapa real. */}
      <Map issues={issues} center={center} mapStyle={mapStyle} ref={ref} />
    </div>
  );
});

// Define um nome de exibição para o componente, útil para depuração.
InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
