import { useEffect, useState } from "react";

// Leaflet + OpenStreetMap: gratuito e sem chave de API. Carregado sob
// demanda pelo cdnjs, só quando algum mapa com coordenadas aparece.
const VERSION = "1.9.4";
const JS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${VERSION}/leaflet.min.js`;
const CSS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${VERSION}/leaflet.min.css`;

let promise = null;

function load() {
  if (window.L) return Promise.resolve(window.L);
  if (promise) return promise;
  promise = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS;
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = JS;
    script.async = true;
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error("Leaflet indisponível")));
    script.onerror = () => reject(new Error("Falha ao carregar o mapa"));
    document.head.appendChild(script);
  }).catch((e) => {
    promise = null;
    throw e;
  });
  return promise;
}

/** Devolve `L` quando carregado, `null` enquanto carrega, `false` se falhar. */
export function useLeaflet(enabled = true) {
  const [L, setL] = useState(() => (typeof window !== "undefined" && window.L) || null);
  useEffect(() => {
    if (!enabled || L) return undefined;
    let alive = true;
    load()
      .then((lib) => alive && setL(lib))
      .catch(() => alive && setL(false));
    return () => {
      alive = false;
    };
  }, [enabled, L]);
  return L;
}
