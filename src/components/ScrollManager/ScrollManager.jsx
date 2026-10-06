import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Volta ao topo ao trocar de página e rola até a âncora quando a URL tem
 * #hash. Mudanças só de query (?filtros) não mexem no scroll, para a
 * listagem não pular a cada filtro.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}
