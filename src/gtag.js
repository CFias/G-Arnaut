// src/gtag.js

// Substitua pelo seu ID do Google Ads
export const GA_TRACKING_ID = 'AW-16519300622';

/**
 * Envia uma visualização de página ao Google Ads
 * @param {string} url - Caminho da URL (ex: "/product/123")
 */
export const pageview = (url) => {
  if (window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

/**
 * Envia um evento de conversão ao Google Ads
 * @param {string} conversionId - ID da conversão (do painel do Google Ads)
 */
export const trackConversion = (conversionId) => {
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
    });
  }
};
/**
 * Envia um evento personalizado ao Google Ads
 * @param {string} eventName - Nome do evento (ex: "purchase")
 * @param {Object} params - Parâmetros adicionais do evento
 */
export const trackEvent = (eventName, params) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};