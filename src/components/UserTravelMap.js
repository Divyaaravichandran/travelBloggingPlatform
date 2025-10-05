import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths for Leaflet in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function UserTravelMap({ userId, height = 380 }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/posts/user/${userId}/with-location`);
        const data = await res.json();
        if (res.ok) {
          const pts = data
            .filter(p => p.location && Array.isArray(p.location.coordinates))
            .map(p => ({
              id: p._id,
              title: p.title,
              image: p.image ? `http://localhost:5000/uploads/posts/${p.image}` : null,
              createdAt: p.createdAt,
              lat: p.location.coordinates[1],
              lng: p.location.coordinates[0],
            }));
          setPoints(pts);
        }
      } catch (e) {
        console.error("Failed to load user locations", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [userId]);

  const center = useMemo(() => {
    if (points.length > 0) return [points[0].lat, points[0].lng];
    return [20, 0]; // world view
  }, [points]);

  const routeLatLngs = useMemo(() => points.map(p => [p.lat, p.lng]), [points]);

  if (loading) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef9fb', borderRadius: 12 }}>Loading map...</div>
  );

  if (points.length === 0) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', borderRadius: 12 }}>No locations yet</div>
  );

  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={3} style={{ height: "100%", width: "100%", borderRadius: 12 }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div style={{ maxWidth: 220 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.title}</div>
                {p.image && (
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                )}
                <a href={`/blog/${p.id}`} style={{ color: '#0a98a7', fontWeight: 600 }}>Open post →</a>
              </div>
            </Popup>
          </Marker>
        ))}
        {routeLatLngs.length > 1 && (
          <Polyline positions={routeLatLngs} color="#0a98a7" weight={4} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}

export default UserTravelMap;


