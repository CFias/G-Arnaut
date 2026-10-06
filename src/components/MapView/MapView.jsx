import { useMemo } from "react";
import { MapPin } from "lucide-react";
import "./styles.css";

/**
 * Mapa da listagem e do detalhe.
 *
 * Hoje é um placeholder: os marcadores são posicionados proporcionalmente
 * a lat/lng quando o imóvel tem coordenadas, ou numa posição estável
 * derivada do id quando não tem. A interface (markers, selectedId,
 * onSelect) é a mesma que um componente de Google Maps ou Mapbox precisa:
 * para integrar, troque o conteúdo deste arquivo mantendo as props.
 *
 * markers: [{ id, lat, lng, label }]
 */
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

function project(markers) {
  const withCoords = markers.filter((m) => m.lat != null && m.lng != null);
  const lats = withCoords.map((m) => m.lat);
  const lngs = withCoords.map((m) => m.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;

  return markers.map((m) => {
    if (m.lat != null && m.lng != null && withCoords.length > 1) {
      return { ...m, x: 12 + ((m.lng - minLng) / spanLng) * 76, y: 12 + ((maxLat - m.lat) / spanLat) * 76 };
    }
    const h = hash(m.id);
    return { ...m, x: 14 + (h % 72), y: 14 + ((h >> 8) % 72) };
  });
}

export default function MapView({ markers = [], selectedId = null, onSelect, caption, className = "" }) {
  const points = useMemo(() => project(markers), [markers]);

  return (
    <div className={`mapview ${className}`}>
      <div className="mapview-grid" aria-hidden="true" />
      {caption && (
        <span className="mapview-caption">
          <MapPin size={13} /> {caption}
        </span>
      )}
      {points.map((m) => {
        const on = m.id === selectedId;
        return (
          <button
            key={m.id}
            type="button"
            className={`mapview-pin${on ? " is-on" : ""}`}
            style={{ left: `${m.x}%`, top: `${m.y}%`, zIndex: on ? 4 : 2 }}
            onClick={() => onSelect?.(on ? null : m.id)}
            aria-pressed={on}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
