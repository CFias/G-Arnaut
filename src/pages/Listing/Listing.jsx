import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BellRing, List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import PublicLayout from "../../components/PublicLayout/PublicLayout";
import { PropertyCard, PropertyCardSkeleton } from "../../components/PropertyCard/PropertyCard";
import MapView from "../../components/MapView/MapView";
import FiltersDrawer from "./FiltersDrawer";
import AlertModal from "../../components/LeadCapture/AlertModal";
import { useProducts } from "../../hooks/useProducts";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { AGENT, NEGOCIOS, NEGOCIO_BY_KEY, TIPOS } from "../../lib/constants";
import {
  DEFAULT_FILTERS,
  activeChips,
  applyFilters,
  extraChips,
  faixasFor,
  filtersFromParams,
  filtersToParams,
} from "../../lib/filters";
import { brlShort, formatPrice, priceSuffix } from "../../lib/format";
import { trackWhatsApp, waLink } from "../../lib/whatsapp";
import "./styles.css";

const SORTS = [
  ["rel", "Mais relevantes"],
  ["menor", "Menor preço"],
  ["maior", "Maior preço"],
  ["area", "Maior área"],
];

function titleFor(negocio, onlyFavs) {
  if (onlyFavs) return ["Seus", "favoritos"];
  if (!negocio) return ["Todos os", "imóveis"];
  return NEGOCIO_BY_KEY[negocio].title;
}

export const Listing = () => {
  const [params, setParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { favorites } = useFavorites();
  const [selectedPin, setSelectedPin] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(params.get("filtros") === "1");
  const [alertOpen, setAlertOpen] = useState(false);

  const filters = useMemo(() => filtersFromParams(params), [params]);
  const onlyFavs = params.get("favoritos") === "1";
  const viewMode = params.get("view") === "mapa" ? "mapa" : "lista";

  // ?filtros=1 (vindo da home) abre o drawer uma vez e sai da URL
  useEffect(() => {
    if (params.get("filtros") === "1") {
      const next = new URLSearchParams(params);
      next.delete("filtros");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const extras = useMemo(
    () => ({ favoritos: onlyFavs ? "1" : "", view: viewMode === "mapa" ? "mapa" : "" }),
    [onlyFavs, viewMode],
  );

  const writeFilters = useCallback(
    (next, extra = extras) => {
      setParams(filtersToParams(next, extra), { replace: true });
      setSelectedPin(null);
    },
    [extras, setParams],
  );

  const setFilter = useCallback(
    (key, value) => {
      const next = { ...filters, [key]: value };
      if (key === "negocio") next.faixa = "0";
      writeFilters(next);
    },
    [filters, writeFilters],
  );

  const clearAll = () => writeFilters(DEFAULT_FILTERS, { view: extras.view });
  const setView = (mode) => writeFilters(filters, { ...extras, view: mode === "mapa" ? "mapa" : "" });

  const results = useMemo(
    () => applyFilters(products, filters, { favorites: onlyFavs ? favorites : null }),
    [products, filters, onlyFavs, favorites],
  );

  const bairros = useMemo(
    () => [...new Set(products.map((p) => p.neighborhood).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );

  // Pré-preenche o alerta com a busca atual (teto da faixa de preço vira o valor máximo)
  const alertInitial = useMemo(() => {
    const fx = faixasFor(filters.negocio).find((x) => x[0] === filters.faixa);
    return {
      negocio: filters.negocio,
      tipo: filters.tipo,
      bairro: filters.bairro,
      quartos: filters.quartos,
      priceMax: fx && Number.isFinite(fx[3]) ? fx[3] : 0,
    };
  }, [filters]);

  const chips = activeChips(filters);
  const extraCount = extraChips(filters).length;
  const [t1, t2] = titleFor(filters.negocio, onlyFavs);
  useDocumentTitle(`${t1} ${t2}`.trim());

  const resultTxt = loading
    ? "Carregando imóveis…"
    : `${results.length} ${results.length === 1 ? "imóvel encontrado" : "imóveis encontrados"} em Salvador e região`;

  const markers = useMemo(
    () => results.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: brlShort(p.price) })),
    [results],
  );

  return (
    <PublicLayout>
      <section className="container listing">
        <header className="listing-head">
          <div>
            <h1 className="page-title">
              {`${t1} ${t2}`.trim()}
            </h1>
            <p className="muted listing-count" aria-live="polite">{resultTxt}</p>
          </div>
          <div className="view-toggle" role="group" aria-label="Modo de visualização">
            <button type="button" aria-pressed={viewMode === "lista"} onClick={() => setView("lista")}>
              <List size={15} /> Lista
            </button>
            <button type="button" aria-pressed={viewMode === "mapa"} onClick={() => setView("mapa")}>
              <MapIcon size={15} /> Mapa
            </button>
          </div>
        </header>

        {/* ---------- Barra de filtros ---------- */}
        <div className="filter-bar">
          <div className="filter-negocios" role="group" aria-label="Negócio">
            <button type="button" className="neg-chip" aria-pressed={!filters.negocio} onClick={() => setFilter("negocio", "")}>
              Todos
            </button>
            {NEGOCIOS.map((n) => (
              <button
                key={n.key}
                type="button"
                className="neg-chip"
                aria-pressed={filters.negocio === n.key}
                onClick={() => setFilter("negocio", n.key)}
              >
                {n.label}
              </button>
            ))}
          </div>

          <div className="filter-fields">
            <select className="select input--sm" aria-label="Tipo de imóvel" value={filters.tipo} onChange={(e) => setFilter("tipo", e.target.value)}>
              <option value="">Todos os tipos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select className="select input--sm" aria-label="Bairro" value={filters.bairro} onChange={(e) => setFilter("bairro", e.target.value)}>
              <option value="">Todos os bairros</option>
              {bairros.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              className="select input--sm"
              aria-label="Faixa de preço"
              value={filters.faixa}
              onChange={(e) => setFilter("faixa", e.target.value)}
              disabled={!filters.negocio}
              title={!filters.negocio ? "Escolha um tipo de negócio para filtrar por preço" : undefined}
            >
              {faixasFor(filters.negocio).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button type="button" className="btn btn--outline btn--sm more-filters" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal size={15} /> Mais filtros
              {extraCount > 0 && <span className="more-count">{extraCount}</span>}
            </button>
            <select className="select input--sm sort-select" aria-label="Ordenar" value={filters.ordem} onChange={(e) => setFilter("ordem", e.target.value)}>
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {(chips.length > 0 || onlyFavs) && (
          <div className="active-chips">
            {onlyFavs && (
              <button type="button" className="chip chip--soft" onClick={() => writeFilters(filters, { view: extras.view })}>
                Só favoritos <X size={14} />
              </button>
            )}
            {chips.map((c) => (
              <button key={c.key} type="button" className="chip chip--soft" onClick={() => setFilter(c.key, c.reset)} aria-label={`Remover filtro ${c.label}`}>
                {c.label} <X size={14} />
              </button>
            ))}
            <button type="button" className="link-btn" onClick={clearAll}>
              Limpar tudo
            </button>
          </div>
        )}

        {/* ---------- Resultados ---------- */}
        {loading ? (
          <div className="property-grid">
            {Array.from({ length: 8 }, (_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="empty-box listing-empty">
            <strong>
              {onlyFavs && !favorites.length ? "Você ainda não salvou imóveis" : "Nada por aqui — ainda."}
            </strong>
            <p>
              {onlyFavs && !favorites.length
                ? "Toque no coração de um imóvel para guardá-lo aqui."
                : "Muitos imóveis chegam antes de irem para o site. Me conta o que você procura que eu busco para você."}
            </p>
            <div className="empty-actions">
              <a
                className="btn btn--primary"
                href={waLink(`Olá, ${AGENT.firstName}! Não encontrei no site o imóvel que procuro. Pode me ajudar?`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsApp()}
              >
                Pedir busca no WhatsApp
              </a>
              {!onlyFavs && (
                <button type="button" className="btn btn--outline" onClick={() => setAlertOpen(true)}>
                  <BellRing size={16} /> Me avise quando surgir
                </button>
              )}
              <button type="button" className="btn btn--ghost" onClick={clearAll}>
                Limpar filtros
              </button>
            </div>
          </div>
        ) : viewMode === "lista" ? (
          <div className="property-grid">
            {results.map((p, i) => <PropertyCard key={p.id} product={p} priority={i < 3} />)}
          </div>
        ) : (
          <div className="map-layout">
            <ul className="map-list">
              {results.map((p) => (
                <li key={p.id}>
                  <div
                    className={`map-item${selectedPin === p.id ? " is-on" : ""}`}
                    onClick={() => setSelectedPin(p.id)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedPin(p.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedPin === p.id}
                  >
                    <div className="map-item-img img-placeholder">
                      {p.cover && <img src={p.cover} alt="" loading="lazy" />}
                    </div>
                    <div className="map-item-body">
                      <span className="map-item-kicker">{p.category} · {p.neighborhood}</span>
                      <span className="map-item-title">{p.title}</span>
                      <span className="map-item-price">
                        {formatPrice(p)}
                        {p.price > 0 && <small>{priceSuffix(p.negocio)}</small>}
                      </span>
                      <Link to={`/product/${p.id}`} className="map-item-link" onClick={(e) => e.stopPropagation()}>
                        Ver imóvel <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="map-panel">
              <MapView
                markers={markers}
                selectedId={selectedPin}
                onSelect={setSelectedPin}
                caption="Mapa ilustrativo — posições aproximadas"
              />
            </div>
          </div>
        )}
      </section>

      {!loading && results.length > 0 && !onlyFavs && (
        <div className="container">
          <div className="alert-strip">
            <div>
              <strong>Não encontrou o que procura?</strong>
              <span>Deixe sua busca salva e receba um aviso quando surgir um imóvel assim.</span>
            </div>
            <button type="button" className="btn btn--outline" onClick={() => setAlertOpen(true)}>
              <BellRing size={16} /> Me avise quando surgir
            </button>
          </div>
        </div>
      )}

      {alertOpen && (
        <AlertModal initial={alertInitial} bairros={bairros} onClose={() => setAlertOpen(false)} />
      )}

      {drawerOpen && (
        <FiltersDrawer
          filters={filters}
          setFilter={setFilter}
          resultCount={results.length}
          onClear={clearAll}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </PublicLayout>
  );
};

export default Listing;
