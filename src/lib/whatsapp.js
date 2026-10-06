import { AGENT, CONVERSIONS, SITE_URL } from "./constants";
import { trackConversion } from "../gtag";
import { createLead } from "../services/leads";

export const DEFAULT_MESSAGE = `Olá, ${AGENT.firstName}! Vim pelo site e gostaria de atendimento.`;

/** Link wa.me com a mensagem já codificada. */
export const waLink = (message = DEFAULT_MESSAGE, phone = AGENT.whatsapp) =>
  `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const productUrl = (id) => `${SITE_URL}/product/${id}`;

export const productMessage = (p) =>
  `Olá, ${AGENT.firstName}! Tenho interesse no imóvel ${p.code} — ${p.title}.\n${productUrl(p.id)}`;

/**
 * Chamado no onClick de qualquer link de WhatsApp.
 * Usamos <a href target="_blank"> (e não window.open atrasado) para o
 * navegador não bloquear a janela; aqui só registramos a conversão e,
 * quando faz sentido, o lead no Firestore — sem bloquear a navegação.
 */
export function trackWhatsApp({ product, source = "whatsapp", name = "", message = "" } = {}) {
  trackConversion(CONVERSIONS.whatsapp);
  if (product || name) {
    createLead({
      name,
      productId: product?.id || null,
      productTitle: product?.title || "",
      productCode: product?.code || "",
      source,
      message,
    });
  }
}

export const trackCall = () => trackConversion(CONVERSIONS.call);
