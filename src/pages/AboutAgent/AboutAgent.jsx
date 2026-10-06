import { Link } from "react-router-dom";
import { Calculator, FileText, KeyRound, MessageCircle, Video } from "lucide-react";
import PublicLayout from "../../components/PublicLayout/PublicLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { AGENT } from "../../lib/constants";
import { trackWhatsApp, waLink } from "../../lib/whatsapp";
import Profile from "../../assets/image/arnaut-profile.webp";
import "./styles.css";

const SERVICES = [
  [KeyRound, "Compra, venda e aluguel", "Consultoria do primeiro filtro à assinatura do contrato."],
  [Calculator, "Avaliação imobiliária", "Preço justo com base em comparativos reais do bairro."],
  [FileText, "Financiamento e documentação", "Assessoria junto a bancos, cartórios e construtoras."],
  [Video, "Visitas guiadas", "Tours presenciais ou por vídeo, no seu horário."],
];

export const AboutAgent = () => {
  useDocumentTitle("Sobre o corretor");

  return (
    <PublicLayout>
      <section className="container about">
        <div className="about-hero">
          <div className="about-photo">
            <img src={Profile} alt={AGENT.name} width={640} height={640} />
          </div>
          <div className="about-text">
            <span className="eyebrow">{AGENT.role}</span>
            <h1 className="page-title">{AGENT.name}</h1>
            <span className="creci">{AGENT.creci}</span>
            <p>{AGENT.bio}</p>
            <p className="about-contact">
              <a href={`mailto:${AGENT.email}`}>{AGENT.email}</a>
              <span aria-hidden="true">·</span>
              <a href={AGENT.phoneHref}>{AGENT.phoneDisplay}</a>
            </p>
            <div className="about-actions">
              <a className="btn btn--primary" href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp()}>
                <MessageCircle size={16} /> Conversar no WhatsApp
              </a>
              <Link to="/imoveis" className="btn btn--outline">Ver imóveis</Link>
            </div>
          </div>
        </div>

        <div className="about-services" id="servicos">
          <h2 className="section-title">
            Como posso ajudar
          </h2>
          <div className="service-grid">
            {SERVICES.map(([Icon, title, desc]) => (
              <div key={title} className="service-card">
                <span className="service-icon"><Icon size={20} /></span>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutAgent;
