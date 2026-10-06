import { negocioGroup } from "./constants";

/**
 * Converte valores no formato brasileiro para número.
 * Aceita o que já existe no Firestore: "R$ 350.000,00", "350.000", "200m²",
 * "1.200 m²", 350000. Devolve 0 quando não há número.
 */
export function parseNumberBR(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value == null) return 0;
  const match = String(value).match(/-?[\d.,]+/);
  if (!match) return 0;
  const raw = match[0];

  if (raw.includes(",")) {
    const n = Number(raw.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  const parts = raw.split(".");
  // "350.000" → separador de milhar; "3.5" → decimal
  if (parts.length > 1 && parts.slice(1).every((p) => p.length === 3)) {
    return Number(parts.join("")) || 0;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Só os dígitos de um input ("1.250.000" → 1250000). */
export const digitsToNumber = (value) =>
  Number(String(value ?? "").replace(/\D/g, "")) || 0;

export const brl = (n) =>
  "R$ " + Math.round(n || 0).toLocaleString("pt-BR");

/** Versão curta para marcadores de mapa e tabelas: "R$ 1,25 mi", "R$ 640 mil". */
export function brlShort(n) {
  if (n >= 1e6) return "R$ " + (n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " mi";
  if (n >= 1e4) return "R$ " + Math.round(n / 1e3) + " mil";
  return brl(n);
}

export const priceSuffix = (negocio) => {
  const g = negocioGroup(negocio);
  return g === "dia" ? " /diária" : g === "mes" ? " /mês" : "";
};

export const pricePrefix = (negocio) => (negocio === "lancamento" ? "desde " : "");

/** Preço completo do card: "desde R$ 690.000" / "R$ 4.200" + sufixo à parte. */
export const formatPrice = (p) =>
  p.price ? pricePrefix(p.negocio) + brl(p.price) : "Sob consulta";

export function priceLabel(negocio) {
  const g = negocioGroup(negocio);
  if (g === "dia") return "Diária";
  if (g === "mes") return "Aluguel mensal";
  if (negocio === "lancamento") return "Lançamento · a partir de";
  return "Valor de venda";
}

/** Formata o valor de um input de dinheiro enquanto a pessoa digita. */
export const maskMoney = (value) => {
  const n = digitsToNumber(value);
  return n ? n.toLocaleString("pt-BR") : "";
};

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Hoje, 10:42" · "Ontem, 18:30" · "3 out, 11:20" */
export function relativeDate(date) {
  if (!date) return "";
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (sameDay(date, now)) return `Hoje, ${time}`;
  if (sameDay(date, yesterday)) return `Ontem, ${time}`;
  const day = date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
  return `${day}, ${time}`;
}

/** Firestore Timestamp | Date | string → Date | null */
export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function youtubeId(url) {
  if (!url) return null;
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

export const normalizeText = (s = "") =>
  String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
