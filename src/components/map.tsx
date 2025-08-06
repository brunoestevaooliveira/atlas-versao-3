'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Issue } from '@/lib/types';
import L from 'leaflet';

// Leaflet's default icons are not easily available in this environment, so we create a custom one.
const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


interface MapProps {
  issues: Issue[];
}

const Map: React.FC<MapProps> = ({ issues }) => {
  const center: [number, number] = [-15.92, -48.04]; // Center of Santa Maria, DF

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map(issue => (
        <Marker key={issue.id} position={[issue.location.lat, issue.location.lng]} icon={defaultIcon}>
          <Popup>
            <div className="font-bold">{issue.title}</div>
            <div>{issue.category}</div>
            <div className="text-sm text-muted-foreground">{issue.status}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
