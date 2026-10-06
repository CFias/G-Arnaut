import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const COUNTERS = [
  ["Quartos", "quartos"],
  ["Banheiros", "banheiros"],
  ["Vagas de garagem", "vagas"],
];

const AREAS = [
  ["0", "Tanto faz"],
  ["50", "50+ m²"],
  ["100", "100+ m²"],
  ["200", "200+ m²"],
  ["300", "300+ m²"],
];

const TOGGLES = [
  ["mobiliado", "Mobiliado", "Pronto para chegar com a mala"],
  ["pet", "Aceita pet", "Seu bichinho é bem-vindo"],
];

/** Painel lateral "Mais filtros" (440px, raio 16). */
export default function FiltersDrawer({ filters, setFilter, resultCount, onClear, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const verLabel = resultCount
    ? `Ver ${resultCount} ${resultCount === 1 ? "imóvel" : "imóveis"}`
    : "Nenhum imóvel — ajuste os filtros";

  return createPortal(
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet-head">
          <h2 id="sheet-title">
            Mais filtros
          </h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Fechar filtros">
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body">
          {COUNTERS.map(([label, key]) => (
            <fieldset key={key} className="sheet-group">
              <legend>{label}</legend>
              <div className="sheet-chips">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="chip"
                    aria-pressed={filters[key] === n}
                    onClick={() => setFilter(key, n)}
                  >
                    {n ? `${n}+` : "Tanto faz"}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          <fieldset className="sheet-group">
            <legend>Área mínima</legend>
            <div className="sheet-chips">
              {AREAS.map(([v, label]) => (
                <button key={v} type="button" className="chip" aria-pressed={filters.area === v} onClick={() => setFilter("area", v)}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="sheet-toggles">
            {TOGGLES.map(([key, label, desc]) => (
              <div key={key} className="sheet-toggle">
                <span>
                  <strong id={`t-${key}`}>{label}</strong>
                  <small>{desc}</small>
                </span>
                <button
                  type="button"
                  role="switch"
                  className="switch"
                  aria-checked={filters[key]}
                  aria-labelledby={`t-${key}`}
                  onClick={() => setFilter(key, !filters[key])}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="sheet-foot">
          <button type="button" className="btn btn--outline" onClick={onClear}>
            Limpar
          </button>
          <button type="button" className="btn btn--primary sheet-apply" onClick={onClose}>
            {verLabel}
          </button>
        </div>
      </aside>
    </>,
    document.body,
  );
}
