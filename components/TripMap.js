'use client';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

function pinIcon(category, label) {
  return L.divIcon({
    className: 'pin-wrap',
    html: `<span class="pin pin-${category || 'food'}">${label}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0].location, 14);
    else map.fitBounds(points.map((p) => [p.location.lat, p.location.lng]), { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export default function TripMap({ points, center, showRoute }) {
  const located = points.filter((p) => p.location);
  const start = center || located[0]?.location || { lat: 20, lng: 0 };

  return (
    <div className="map">
      <MapContainer center={[start.lat, start.lng]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showRoute && located.length > 1 && (
          <Polyline positions={located.map((p) => [p.location.lat, p.location.lng])} pathOptions={{ color: '#1b7f79', weight: 4, opacity: 0.9 }} />
        )}
        {located.map((p, i) => (
          <Marker key={`${p.name}-${i}`} position={[p.location.lat, p.location.lng]} icon={pinIcon(p.category, p.label ?? i + 1)}>
            <Popup>
              <div className="infowindow">
                <strong>{p.name}</strong>
                {p.time && <p>{p.time}</p>}
                <p>{p.address}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address}`)}`} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
        <FitBounds points={located} />
      </MapContainer>
      {located.length < points.length && (
        <p className="map-note">{points.length - located.length} place(s) couldn’t be found on the map.</p>
      )}
    </div>
  );
}
