import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";

/* ---------------- Leaflet Icon Fix ---------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ---------------- Helpers ---------------- */

function googleDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
}

/* ---------------- Component ---------------- */

export default function ProPrintCenters() {
  const [query, setQuery] = useState("");
  const [centers, setCenters] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallback = { lat: 12.9716, lng: 77.5946 };

  /* -------- Get User Location -------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLoc(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setUserLoc(fallback);
      }
    );
  }, []);

  /* -------- Fetch Real Nearby Shops (FREE OSM) -------- */
  useEffect(() => {
    if (!userLoc) return;

    const fetchPlaces = async () => {
      setLoading(true);

      const overpassQuery = `
        [out:json];
        (
          node["amenity"="internet_cafe"](around:5000,${userLoc.lat},${userLoc.lng});
          node["shop"="copyshop"](around:5000,${userLoc.lat},${userLoc.lng});
          node["shop"="printing"](around:5000,${userLoc.lat},${userLoc.lng});
          node["shop"="stationery"](around:5000,${userLoc.lat},${userLoc.lng});
          node["office"="copyshop"](around:5000,${userLoc.lat},${userLoc.lng});
        );
        out;
      `;

      try {
        const res = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            body: overpassQuery,
          }
        );

        const data = await res.json();

        const formatted = data.elements.map((el) => ({
          id: el.id,
          name: el.tags?.name || "Print Center",
          address:
            el.tags?.["addr:street"] ||
            el.tags?.["addr:full"] ||
            "Address not available",
          phone: el.tags?.phone || "",
          lat: el.lat,
          lng: el.lon,
        }));

        setCenters(formatted);
      } catch (err) {
        console.error("OSM fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [userLoc]);

  /* -------- Search Filter -------- */
  const filtered = useMemo(() => {
    if (!query) return centers;

    return centers.filter((c) =>
      `${c.name} ${c.address}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, centers]);

  const selected =
    filtered.find((c) => c.id === selectedId) ||
    filtered[0] ||
    null;

  const mapCenter = selected || userLoc || fallback;

  return (
    <section className="min-h-screen bg-[#F7FBFF]">
      <div className="max-w-7xl mx-auto px-5 py-8">

        <h1 className="text-3xl font-extrabold mb-4">
          Nearby Print Centers
        </h1>

        {/* Search */}
        <div className="relative mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full h-11 rounded-xl border pl-10 pr-4"
          />
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6">

          {/* List */}
          <div className="space-y-4">
            {loading && <div>Loading nearby shops...</div>}

            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="w-full text-left bg-white border rounded-xl p-4 hover:border-blue-300"
              >
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-gray-500">{c.address}</div>

                <div className="flex gap-3 mt-2">
                  <a
                    href={googleDirectionsUrl(c.lat, c.lng)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 text-sm"
                  >
                    Directions
                  </a>

                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 text-sm"
                    >
                      Calls
                    </a>
                  )}
                </div>
              </button>
            ))}

            {!loading && filtered.length === 0 && (
              <div>No shops found nearby.</div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl overflow-hidden border">
            <div className="h-[520px]">
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FlyTo center={mapCenter} />

                {filtered.map((c) => (
                  <Marker key={c.id} position={[c.lat, c.lng]}>
                    <Popup>
                      <div className="font-bold">{c.name}</div>
                      <div>{c.address}</div>
                      <a
                        href={googleDirectionsUrl(c.lat, c.lng)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm"
                      >
                        Directions
                      </a>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}