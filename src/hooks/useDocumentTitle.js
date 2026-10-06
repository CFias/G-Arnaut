import { useEffect } from "react";

const SUFFIX = "Gildavi Arnaut Imóveis";

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} · ${SUFFIX}`;
  }, [title]);
}
