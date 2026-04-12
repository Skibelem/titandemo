import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  selectedLat?: number;
  selectedLng?: number;
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ onLocationSelect, selectedLat, selectedLng }: LocationPickerMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    selectedLat && selectedLng ? [selectedLat, selectedLng] : null
  );
  const [loading, setLoading] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    const address = await reverseGeocode(lat, lng);
    onLocationSelect(lat, lng, address);
  };

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-border" style={{ height: '200px' }}>
        <MapContainer
          center={position || [6.5244, 3.3792]} // Lagos default
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onLocationSelect={handleClick} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground animate-pulse">Getting address...</p>
      )}
      {position && !loading && (
        <p className="text-xs text-muted-foreground">📍 Tap the map to change location</p>
      )}
      {!position && (
        <p className="text-xs text-muted-foreground">📍 Tap the map to select your delivery location</p>
      )}
    </div>
  );
}
