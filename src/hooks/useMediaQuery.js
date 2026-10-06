import { useEffect, useState } from "react";

/** true quando a tela tem menos de 900px (breakpoint principal do projeto). */
export function useIsNarrow(breakpoint = 900) {
  const query = `(max-width: ${breakpoint - 0.05}px)`;
  const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
  const [narrow, setNarrow] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setNarrow(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return narrow;
}
