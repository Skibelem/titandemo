import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Titans Coffee shop coordinates (Lagos, Nigeria)
export const SHOP_LAT = 6.5244;
export const SHOP_LNG = 3.3792;
export const SHOP_ADDRESS = '123 Desert Tech Blvd, Lagos, Nigeria';

export default function ShopLocationMap() {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${SHOP_LAT},${SHOP_LNG}`;

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-border" style={{ height: '160px' }}>
        <MapContainer
          center={[SHOP_LAT, SHOP_LNG]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[SHOP_LAT, SHOP_LNG]}>
            <Popup>Titans Coffee ☕</Popup>
          </Marker>
        </MapContainer>
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-display"
      >
        📍 Get Directions →
      </a>
    </div>
  );
}
