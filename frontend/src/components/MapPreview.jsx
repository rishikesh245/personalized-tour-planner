import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import axios from "axios";
import { Compass, MapPin } from "lucide-react";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
};

// Fix for Leaflet tile clipping when rendered inside animated modal dialogs
const InvalidateMapSize = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 350);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const MapPreview = ({ destination, places }) => {
  const [center, setCenter] = useState([20, 0]); // Default
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const geocodeItems = async () => {
      try {
        if (!destination) return;
        // Clean multi-destination strings e.g. "Ooty + Mysuru" or "Paris, France"
        const city = destination.split("+")[0].split(",")[0].trim();
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
        
        if (res.data.length > 0) {
          const lat = parseFloat(res.data[0].lat);
          const lon = parseFloat(res.data[0].lon);
          setCenter([lat, lon]);

          // Geocode internal places (limit to first 5 to avoid rate limits)
          const placeMarkers = [];
          const placesList = Array.isArray(places) ? places : [];
          for (let p of placesList.slice(0, 5)) {
            const pName = typeof p === "string" ? p : p.place_name;
            if (!pName) continue;
            try {
              const pRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pName + ", " + city)}`);
              if (pRes.data.length > 0) {
                placeMarkers.push({
                  name: pName,
                  pos: [parseFloat(pRes.data[0].lat), parseFloat(pRes.data[0].lon)]
                });
              }
            } catch (ignore) {
              // Rate limit safeguard
            }
          }
          setMarkers(placeMarkers);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    };

    if (destination) geocodeItems();
  }, [destination, places]);

  return (
    <div className="luxury-map-container">
      <div className="luxury-map-header">
        <div className="map-kicker">
          <Compass size={14} className="map-compass-icon" />
          <span>CARTOGRAPHIC OVERVIEW</span>
        </div>
        <div className="map-destination-label">
          <MapPin size={13} />
          <span>{destination}</span>
        </div>
      </div>

      <div className="luxury-map-viewport">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <RecenterMap center={center} />
          <InvalidateMapSize />
          {markers.map((m, i) => (
            <Marker key={i} position={m.pos}>
              <Popup>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#292D2A" }}>
                  {m.name}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style>{`
        .luxury-map-container {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 30px;
          box-shadow: 0 4px 16px rgba(41, 45, 42, 0.03);
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .luxury-map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #F7F7F4;
          border-bottom: 1px solid #E8E9E5;
        }
        .map-kicker {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #263C32;
          text-transform: uppercase;
        }
        .map-compass-icon {
          color: #C4A46D;
        }
        .map-destination-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #777D78;
        }
        .luxury-map-viewport {
          height: 280px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default MapPreview;
