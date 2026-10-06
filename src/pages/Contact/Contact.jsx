import { useState } from "react";
import { ArrowRight, ArrowUpRight, AtSign, Mail, Phone } from "lucide-react";
import PublicLayout from "../../components/PublicLayout/PublicLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { AGENT } from "../../lib/constants";
import { trackCall, trackWhatsApp, waLink } from "../../lib/whatsapp";
import "./styles.css";

const INTERESTS = ["Comprar", "Alugar", "Lançamentos", "Temporada", "Comercial", "Vender meu imóvel"];

export const Contact = () => {
  useDocumentTitle("Contato");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("Comprar");
  const [msg, setMsg] = useState("");

  const message =
    `Olá, ${AGENT.firstName}! ` +
    (name.trim() ? `Sou ${name.trim()}. ` : "") +
    `Interesse: ${interest}.` +
    (msg.trim() ? ` ${msg.trim()}` : "");

  const channels = [
    { icon: Phone, label: "Telefone", value: AGENT.phoneDisplay, href: AGENT.phoneHref, onClick: trackCall },
    { icon: Mail, label: "E-mail", value: AGENT.email, href: `mailto:${AGENT.email}` },
    AGENT.instagram && {
      icon: AtSign,
      label: "Instagram",
      value: `@${AGENT.instagram}`,
      href: `https://instagram.com/${AGENT.instagram}`,
      external: true,
    },
  ].filter(Boolean);

  return (
    <PublicLayout>
      <section className="container contact">
        <h1 className="contact-title">
          Vamos conversar?
        </h1>

        <div className="contact-grid">
          <div className="contact-channels">
            <a className="wa-card" href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp()}>
              <span className="wa-card-kicker">Resposta mais rápida</span>
              <span className="wa-card-title">
                WhatsApp <ArrowUpRight size={22} />
              </span>
              <span className="wa-card-number">{AGENT.phoneDisplay}</span>
            </a>
            {channels.map(({ icon: Icon, label, value, href, onClick, external }) => (
              <a
                key={label}
                className="channel"
                href={href}
                onClick={onClick}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span className="channel-icon"><Icon size={18} /></span>
                <span className="channel-text">
                  <small>{label}</small>
                  <strong>{value}</strong>
                </span>
                <ArrowRight size={16} className="channel-arrow" />
              </a>
            ))}
          </div>

          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              trackWhatsApp({ source: "form", name: name.trim() || "Contato pelo site", message });
              window.open(waLink(message), "_blank", "noopener,noreferrer");
            }}
          >
            <div>
              <h2>
                Me conta o que você procura
              </h2>
              <p className="muted">A mensagem é montada aqui e enviada pelo seu WhatsApp.</p>
            </div>

            <label className="field">
              <span className="field-label">Seu nome</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como posso te chamar?" autoComplete="name" />
            </label>

            <fieldset className="field contact-interests">
              <legend className="field-label">Interesse</legend>
              <div className="contact-chips">
                {INTERESTS.map((i) => (
                  <button key={i} type="button" className="chip" aria-pressed={interest === i} onClick={() => setInterest(i)}>
                    {i}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="field">
              <span className="field-label">Mensagem</span>
              <textarea className="textarea" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Bairro, faixa de preço, número de quartos…" />
            </label>

            <button type="submit" className="btn btn--primary btn--lg">
              Enviar pelo WhatsApp <ArrowUpRight size={16} />
            </button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
