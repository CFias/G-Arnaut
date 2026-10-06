import { FAIXAS, NEGOCIO_BY_KEY, negocioGroup, negocioLabel } from "./constants";
import { normalizeText } from "./format";

export const DEFAULT_FILTERS = {
  negocio: "",
  tipo: "",
  bairro: "",
  faixa: "0",
  area: "0",
  quartos: 0,
  banheiros: 0,
  vagas: 0,
  mobiliado: false,
  pet: false,
  ordem: "rel",
  kw: "",
};

const NUMERIC = ["quartos", "banheiros", "vagas"];
const BOOLEAN = ["mobiliado", "pet"];

/** URLSearchParams → objeto de filtros (valores inválidos viram default). */
export function filtersFromParams(params) {
  const f = { ...DEFAULT_FILTERS };
  for (const key of Object.keys(DEFAULT_FILTERS)) {
    const v = params.get(key);
    if (v == null || v === "") continue;
    if (NUMERIC.includes(key)) f[key] = Math.max(0, Math.min(4, parseInt(v, 10) || 0));
    else if (BOOLEAN.includes(key)) f[key] = v === "1" || v === "true";
    else f[key] = v;
  }
  if (f.negocio && !NEGOCIO_BY_KEY[f.negocio]) f.negocio = "";
  return f;
}

/** Objeto de filtros → query string enxuta (só o que difere do default). */
export function filtersToParams(filters, extra = {}) {
  const params = new URLSearchParams();
  for (const [key, def] of Object.entries(DEFAULT_FILTERS)) {
    const v = filters[key];
    if (v === def || v === "" || v == null || v === false || v === 0) continue;
    params.set(key, BOOLEAN.includes(key) ? "1" : String(v));
  }
  for (const [k, v] of Object.entries(extra)) if (v) params.set(k, v);
  return params;
}

export const listingUrl = (filters = {}, extra = {}) => {
  const qs = filtersToParams({ ...DEFAULT_FILTERS, ...filters }, extra).toString();
  return `/imoveis${qs ? `?${qs}` : ""}`;
};

export function faixasFor(negocio) {
  if (!negocio) return [["0", "Qualquer valor"]];
  return FAIXAS[negocioGroup(negocio)];
}

function faixaRange(filters) {
  if (!filters.negocio || filters.faixa === "0") return null;
  const fx = faixasFor(filters.negocio).find((x) => x[0] === filters.faixa);
  return fx && fx[2] != null ? fx : null;
}

export const searchText = (p) =>
  normalizeText(
    [p.title, p.neighborhood, p.city, p.description, p.category, p.amenities.join(" "), p.code, p.address].join(" "),
  );

export function applyFilters(products, f, { favorites } = {}) {
  const kw = normalizeText(f.kw.trim());
  const fx = faixaRange(f);
  const minArea = Number(f.area) || 0;

  const result = products.filter(
    (p) =>
      (!favorites || favorites.includes(p.id)) &&
      (!f.negocio || p.negocio === f.negocio) &&
      (!f.tipo || p.category === f.tipo) &&
      (!f.bairro || p.neighborhood === f.bairro) &&
      p.bedrooms >= f.quartos &&
      p.bathrooms >= f.banheiros &&
      p.parkingSpaces >= f.vagas &&
      p.area >= minArea &&
      (!f.mobiliado || p.furnished) &&
      (!f.pet || p.petFriendly) &&
      (!fx || (p.price >= fx[2] && p.price < fx[3])) &&
      (!kw || searchText(p).includes(kw)),
  );

  const sorters = {
    menor: (a, b) => (a.price || Infinity) - (b.price || Infinity),
    maior: (a, b) => b.price - a.price,
    area: (a, b) => b.area - a.area,
    rel: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.views - a.views,
  };
  return result.sort(sorters[f.ordem] || sorters.rel);
}

/** Chips de filtros ativos: [{ label, key, reset }] */
export function activeChips(f) {
  const chips = [];
  if (f.kw) chips.push({ label: `“${f.kw}”`, key: "kw", reset: "" });
  if (f.negocio) chips.push({ label: negocioLabel(f.negocio), key: "negocio", reset: "" });
  if (f.tipo) chips.push({ label: f.tipo, key: "tipo", reset: "" });
  if (f.bairro) chips.push({ label: f.bairro, key: "bairro", reset: "" });
  const fx = faixaRange(f);
  if (fx) chips.push({ label: fx[1], key: "faixa", reset: "0" });
  return chips.concat(extraChips(f));
}

/** Só os filtros que ficam no drawer "Mais filtros". */
export function extraChips(f) {
  const chips = [];
  if (f.area !== "0") chips.push({ label: `${f.area}+ m²`, key: "area", reset: "0" });
  if (f.quartos) chips.push({ label: `${f.quartos}+ quartos`, key: "quartos", reset: 0 });
  if (f.banheiros) chips.push({ label: `${f.banheiros}+ banheiros`, key: "banheiros", reset: 0 });
  if (f.vagas) chips.push({ label: `${f.vagas}+ vagas`, key: "vagas", reset: 0 });
  if (f.mobiliado) chips.push({ label: "Mobiliado", key: "mobiliado", reset: false });
  if (f.pet) chips.push({ label: "Aceita pet", key: "pet", reset: false });
  return chips;
}
