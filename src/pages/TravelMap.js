import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function groupBy(arr, keyFn) {
  return arr.reduce((map, item) => {
    const key = keyFn(item);
    if (!map[key]) map[key] = [];
    map[key].push(item);
    return map;
  }, {});
}

function TravelMap() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [mode, setMode] = useState("global"); // 'global' | 'mine'

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try { return JSON.parse(atob(token.split(".")[1] || ""))?.id || null; } catch { return null; }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const url = mode === 'mine' && currentUserId ? `http://localhost:5000/api/blogs/user/${currentUserId}` : `http://localhost:5000/api/blogs`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) setBlogs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load blogs for map", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, currentUserId]);

  const filtered = useMemo(() => {
    return blogs.filter(b => {
      const hasCoords = b.location && (
        (Array.isArray(b.location.coordinates) && b.location.coordinates.length === 2) ||
        (b.location.geo && (b.location.geo.lat != null && b.location.geo.lng != null))
      );
      if (!hasCoords) return false;
      if (filterUser && String(b.userId) !== String(filterUser)) return false;
      if (filterCategory && String(b.category || '').toLowerCase() !== filterCategory.toLowerCase()) return false;
      if (filterCountry && String(b.location?.country || '').toLowerCase() !== filterCountry.toLowerCase()) return false;
      return true;
    });
  }, [blogs, filterUser, filterCategory, filterCountry]);

  const userGroups = useMemo(() => {
    const withLatLng = filtered.map(b => {
      const lat = b.location?.geo?.lat ?? (Array.isArray(b.location?.coordinates) ? b.location.coordinates[1] : undefined);
      const lng = b.location?.geo?.lng ?? (Array.isArray(b.location?.coordinates) ? b.location.coordinates[0] : undefined);
      return { ...b, __lat: lat, __lng: lng };
    }).filter(b => Number.isFinite(b.__lat) && Number.isFinite(b.__lng));
    const grouped = groupBy(withLatLng, (b) => String(b.userId));
    // sort each user group by createdAt asc for route line
    Object.keys(grouped).forEach((k) => grouped[k].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    return grouped;
  }, [filtered]);

  const countriesVisited = useMemo(() => {
    const set = new Set(filtered.map(b => (b.location?.country || '').trim()).filter(Boolean));
    return set.size;
  }, [filtered]);

  if (loading) return <div style={{ padding: 20 }}>Loading map...</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }}>
          <option value="global">Global Map</option>
          <option value="mine">My Map</option>
        </select>
        <input placeholder="Filter by userId" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd" }} />
        <input placeholder="Category (e.g., adventure)" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
        <input placeholder="Country" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
        <div style={{ marginLeft: 'auto', color: '#0b6270', fontWeight: 600 }}>Countries visited: {countriesVisited} • Posts: {filtered.length}</div>
      </div>
      <div style={{ height: 520, borderRadius: 12, overflow: 'hidden' }}>
        <MapContainer center={[20,0]} zoom={2} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.values(userGroups).flat().map((b) => (
            <Marker key={b._id} position={[b.__lat, b.__lng]}>
              <Popup>
                <div style={{ maxWidth: 220 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
                  {(b.image || (Array.isArray(b.images) && b.images[0])) && (
                    <img src={b.image ? `http://localhost:5000/uploads/posts/${b.image}` : b.images[0]} alt={b.title} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                  )}
                  <a href={`/blog/${b._id}`} style={{ color: '#0a98a7', fontWeight: 600 }}>Open post →</a>
                </div>
              </Popup>
            </Marker>
          ))}

          {Object.values(userGroups).map((group, idx) => (
            group.length > 1 ? (
              <Polyline key={`route-${idx}`} positions={group.map(g => [g.__lat, g.__lng])} color="#0a98a7" weight={4} opacity={0.8} />
            ) : null
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default TravelMap;


