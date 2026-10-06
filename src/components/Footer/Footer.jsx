import { Link } from "react-router-dom";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import { AGENT, NEGOCIOS } from "../../lib/constants";
import { listingUrl } from "../../lib/filters";
import { trackCall, trackWhatsApp, waLink } from "../../lib/whatsapp";
import "./styles.css";

const SELL_MESSAGE = `Olá, ${AGENT.firstName}! Quero vender ou alugar meu imóvel e gostaria de uma avaliação.`;

/** Bloco escuro "Quer vender ou alugar seu imóvel?" — antes do rodapé. */
export function CtaBanner() {
  return (
    <section className="container cta-wrap" aria-labelledby="cta-title">
      <div className="cta">
        <div>
          <h2 id="cta-title">Quer vender ou alugar seu imóvel?</h2>
          <p>Faço a avaliação e cuido da divulgação para você.</p>
        </div>
        <a
          className="btn btn--white btn--lg cta-btn"
          href={waLink(SELL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsApp()}
        >
          <span className="cta-dot" aria-hidden="true" />
          Fale comigo
        </a>
      </div>
    </section>
  );
}

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src={Logo} alt="" width={40} height={40} loading="lazy" />
            <span>{AGENT.name}</span>
          </Link>
          <p>
            Corretor de imóveis em Salvador — BA
            <br />
            <a href={AGENT.phoneHref} onClick={trackCall}>
              {AGENT.phoneDisplay}
            </a>
            <br />
            <a href={`mailto:${AGENT.email}`}>{AGENT.email}</a>
          </p>
        </div>

        <div className="footer-col">
          <h3>Imóveis</h3>
          {NEGOCIOS.map((n) => (
            <Link key={n.key} to={listingUrl({ negocio: n.key })}>
              {n.label}
            </Link>
          ))}
        </div>

        <div className="footer-col">
          <h3>Atendimento</h3>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp()}>
            Falar no WhatsApp
          </a>
          <Link to="/contato">Anunciar meu imóvel</Link>
          <Link to="/contato">Contato</Link>
        </div>

        <div className="footer-col">
          <h3>O corretor</h3>
          <Link to="/about">Sobre Gildavi</Link>
          <Link to="/about#servicos">Serviços</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {year} {AGENT.name} · {AGENT.creci}
        </span>
        <Link to="/admin">Área do corretor →</Link>
      </div>
    </footer>
  );
};

export default Footer;
