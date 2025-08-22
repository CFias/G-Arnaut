// src/gtag.js

// ID do Google Ads
export const GA_TRACKING_ID = "AW-16519300622";

/**
 * Envia uma visualização de página ao Google Ads
 * @param {string} url - Caminho da URL (ex: "/product/123")
 */
export const pageview = (url) => {
  if (typeof window.gtag === "function") {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

/**
 * Envia um evento de conversão ao Google Ads
 * @param {string} conversionId - ID da conversão (do painel do Google Ads)
 */
export const trackConversion = (conversionId) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: conversionId || GA_TRACKING_ID,
    });
  }
};

/**
 * Envia um evento personalizado ao Google Ads
 * @param {string} eventName - Nome do evento (ex: "purchase")
 * @param {Object} params - Parâmetros adicionais do evento
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
};
