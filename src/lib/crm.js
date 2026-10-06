// Regras do CRM que rodam no navegador: o que o lead procura, quais
// imóveis combinam com ele e o quão "quente" ele está.

import { followUpState } from "./format";

export const VISIT_PERIODS = [
  { value: "manha", label: "Manhã", hour: 9 },
  { value: "tarde", label: "Tarde", hour: 14 },
  { value: "noite", label: "Fim de tarde", hour: 17 },
];

export const visitPeriodLabel = (v) => VISIT_PERIODS.find((p) => p.value === v)?.label || "";

/** Data (yyyy-mm-dd) + período → Date no fuso local. */
export function visitDate(day, period) {
  if (!day) return null;
  const [y, m, d] = day.split("-").map(Number);
  const hour = VISIT_PERIODS.find((p) => p.value === period)?.hour ?? 9;
  return new Date(y, m - 1, d, hour, 0, 0);
}

export const EMPTY_WANTS = { negocio: "", tipo: "", bairro: "", priceMax: 0, quartos: 0 };

export const hasWants = (w) =>
  Boolean(w && (w.negocio || w.tipo || w.bairro || w.priceMax || w.quartos));

/**
 * O que o lead procura. Se ele não preencheu, deduz a partir do imóvel
 * que despertou o interesse (mesmo negócio, tipo e bairro, até 20% acima
 * do preço, mesma quantidade de quartos).
 */
export function leadWants(lead, products = []) {
  if (hasWants(lead.wants)) return { ...EMPTY_WANTS, ...lead.wants, inferred: false };
  const p = lead.productId && products.find((x) => x.id === lead.productId);
  if (!p) return null;
  return {
    negocio: p.negocio,
    tipo: p.category,
    bairro: p.neighborhood,
    priceMax: p.price ? Math.round(p.price * 1.2) : 0,
    quartos: p.bedrooms || 0,
    inferred: true,
  };
}

export function matchesWants(wants, p) {
  if (!wants) return false;
  return (
    (!wants.negocio || p.negocio === wants.negocio) &&
    (!wants.tipo || p.category === wants.tipo) &&
    (!wants.bairro || p.neighborhood === wants.bairro) &&
    (!wants.priceMax || !p.price || p.price <= wants.priceMax) &&
    (!wants.quartos || p.bedrooms >= wants.quartos)
  );
}

/** Imóveis publicados que combinam com o lead (exceto o que ele já viu). */
export function matchingProducts(lead, products) {
  const wants = leadWants(lead, products);
  if (!wants) return [];
  return products.filter(
    (p) => p.id !== lead.productId && ["Ativo", "Reservado"].includes(p.listingStatus) && matchesWants(wants, p),
  );
}

/** Leads em aberto que combinam com um imóvel. */
export function matchingLeads(product, leads, products) {
  return leads.filter((l) => l.stage !== "Fechado" && l.productId !== product.id && matchesWants(leadWants(l, products), product));
}

/**
 * Pontuação de 0 a 100 a partir do que o painel já sabe do lead.
 * Não é previsão estatística — é uma régua simples para priorizar.
 */
export function leadScore(lead) {
  if (lead.stage === "Fechado") return null;
  let s = 0;
  if (lead.phone) s += 25;
  if (lead.hasName) s += 10;
  if (lead.productId) s += 5;
  if (hasWants(lead.wants)) s += 10;
  if (lead.visitAt) s += 15;
  if (lead.stage === "Em contato") s += 10;
  if (lead.stage === "Visita marcada") s += 25;
  s += Math.min(15, lead.notes.filter((n) => n.kind === "note").length * 5);

  const days = lead.createdAt ? (Date.now() - lead.createdAt.getTime()) / 86400000 : 99;
  if (days <= 3) s += 10;
  else if (days > 30) s -= 15;
  if (followUpState(lead.followUpAt) === "atrasado") s -= 10;

  return Math.max(0, Math.min(100, Math.round(s)));
}

export function scoreLevel(score) {
  if (score == null) return null;
  if (score >= 60) return { key: "quente", label: "Quente" };
  if (score >= 35) return { key: "morno", label: "Morno" };
  return { key: "frio", label: "Frio" };
}
