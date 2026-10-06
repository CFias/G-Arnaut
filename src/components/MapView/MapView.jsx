import { useEffect, useMemo, useRef } from "react";
import { MapPin } from "lucide-react";
import { useLeaflet } from "./useLeaflet";
import "./styles.css";

/**
 * Mapa da listagem e do detalhe. markers: [{ id, lat, lng, label }]
 *
 * Com coordenadas, usa Leaflet + OpenStreetMap (gratuito). Sem
 * coordenadas, ou se o mapa não carregar, mostra um mapa ilustrativo
 * com posições aproximadas — a interface é a mesma nos dois casos.
 */
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const hasCoords = (m) => Number.isFinite(m.lat) && Number.isFinite(m.lng);

function project(markers) {
  return markers.map((m) => {
    const h = hash(m.id);
    return { ...m, x: 14 + (h % 72), y: 14 + ((h >> 8) % 72) };
  });
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function RealMap({ L, markers, selectedId, onSelect, zoom }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Cria o mapa uma vez
  useEffect(() => {
    const map = L.map(elRef.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // O contêiner pode ter mudado de tamanho (sticky/mobile)
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => {
      clearTimeout(t);
      map.remove();
    };
  }, [L]);

  // Marcadores em pílula de preço
  const key = markers.map((m) => m.id).join(",");
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markers.forEach((m) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="mapview-pin mapview-pin--real${m.id === selectedId ? " is-on" : ""}">${escapeHtml(m.label)}</span>`,
        iconSize: null,
      });
      L.marker([m.lat, m.lng], { icon, zIndexOffset: m.id === selectedId ? 1000 : 0, keyboard: true, title: m.label })
        .on("click", () => onSelectRef.current?.(m.id === selectedId ? null : m.id))
        .addTo(layer);
    });
  }, [L, markers, selectedId]);

  // Enquadra quando a lista muda (não a cada seleção)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markers.length) return;
    if (markers.length === 1) map.setView([markers[0].lat, markers[0].lng], zoom);
    else map.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng])), { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, key, zoom]);

  // Centraliza no selecionado
  useEffect(() => {
    const m = markers.find((x) => x.id === selectedId);
    if (m && mapRef.current) mapRef.current.panTo([m.lat, m.lng]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={elRef} className="mapview-real" />;
}

export default function MapView({ markers = [], selectedId = null, onSelect, caption, className = "", zoom = 15 }) {
  const located = useMemo(() => markers.filter(hasCoords), [markers]);
  const L = useLeaflet(located.length > 0);
  const points = useMemo(() => project(markers), [markers]);
  const missing = markers.length - located.length;

  if (located.length && L) {
    return (
      <div className={`mapview ${className}`}>
        <RealMap L={L} markers={located} selectedId={selectedId} onSelect={onSelect} zoom={zoom} />
        {missing > 0 && (
          <span className="mapview-caption">
            <MapPin size={13} /> {missing} {missing === 1 ? "imóvel sem localização" : "imóveis sem localização"} no mapa
          </span>
        )}
      </div>
    );
  }

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
