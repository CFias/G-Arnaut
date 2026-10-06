import { useState } from "react";
import { ArrowUpRight, CalendarDays, Check, MessageCircle } from "lucide-react";
import Modal from "../Modal/Modal";
import { readContact, saveContact } from "./contactMemory";
import { AGENT } from "../../lib/constants";
import { VISIT_PERIODS, visitDate, visitPeriodLabel } from "../../lib/crm";
import { formatPhone, phoneDigits } from "../../lib/format";
import { productMessage, trackWhatsApp, waLink } from "../../lib/whatsapp";
import "./styles.css";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * "Tenho interesse": pede nome e telefone (opcionais) antes de abrir o
 * WhatsApp, ou registra um pedido de visita. `initialTab`: "whatsapp" | "visita".
 */
export default function InterestModal({ product: p, initialTab = "whatsapp", onClose }) {
  const saved = readContact();
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState(saved.name);
  const [phone, setPhone] = useState(formatPhone(saved.phone));
  const [day, setDay] = useState("");
  const [period, setPeriod] = useState("manha");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null); // { when: Date }

  const digits = phoneDigits(phone);
  const remember = () => saveContact({ name: name.trim(), phone: digits });

  const waMessage = productMessage(p) + (name.trim() ? `\n— ${name.trim()}` : "");

  const goWhatsApp = () => {
    remember();
    trackWhatsApp({ product: p, name: name.trim(), phone: digits });
    onClose();
  };

  const skip = () => {
    trackWhatsApp({ product: p });
    onClose();
  };

  const requestVisit = async (e) => {
    e.preventDefault();
    if (!name.trim() || digits.length < 10) {
      setError("Para agendar, informe seu nome e um telefone com DDD.");
      return;
    }
    if (!day) {
      setError("Escolha o dia da visita.");
      return;
    }
    const when = visitDate(day, period);
    setSending(true);
    remember();
    trackWhatsApp({ product: p, name: name.trim(), phone: digits, source: "visita", visitAt: when, visitPeriod: period, message: `Pedido de visita: ${when.toLocaleDateString("pt-BR")} (${visitPeriodLabel(period)})` });
    setSending(false);
    setDone({ when });
  };

  if (done) {
    const msg = `Olá, ${AGENT.firstName}! Pedi uma visita ao imóvel ${p.code} — ${p.title} para ${done.when.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} (${visitPeriodLabel(period).toLowerCase()}).`;
    return (
      <Modal title="Pedido de visita enviado" onClose={onClose}>
        <div className="capture-done">
          <span className="capture-check"><Check size={22} /></span>
          <p>
            {AGENT.firstName} vai confirmar o horário com você pelo telefone {formatPhone(digits)}. Se quiser agilizar,
            mande uma mensagem agora.
          </p>
          <a className="btn btn--primary btn--block" href={waLink(msg)} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <MessageCircle size={16} /> Avisar no WhatsApp
          </a>
          <button type="button" className="btn btn--ghost btn--block" onClick={onClose}>Fechar</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={p.title} subtitle={`${p.code} · ${p.neighborhood || p.city}`} onClose={onClose}>
      <div className="capture-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "whatsapp"} className={tab === "whatsapp" ? "is-on" : ""} onClick={() => { setTab("whatsapp"); setError(""); }}>
          <MessageCircle size={15} /> Conversar
        </button>
        <button type="button" role="tab" aria-selected={tab === "visita"} className={tab === "visita" ? "is-on" : ""} onClick={() => { setTab("visita"); setError(""); }}>
          <CalendarDays size={15} /> Agendar visita
        </button>
      </div>

      <form className="capture-form" onSubmit={tab === "visita" ? requestVisit : (e) => e.preventDefault()} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label className="field">
          <span className="field-label">Seu nome</span>
          <input className="input" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} autoComplete="name" placeholder="Como posso te chamar?" />
        </label>
        <label className="field">
          <span className="field-label">WhatsApp {tab === "whatsapp" && <small className="muted">(opcional)</small>}</span>
          <input className="input" value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }} inputMode="tel" autoComplete="tel" placeholder="(71) 99999-9999" />
        </label>

        {tab === "visita" && (
          <>
            <label className="field">
              <span className="field-label">Dia</span>
              <input className="input" type="date" min={tomorrow()} value={day} onChange={(e) => { setDay(e.target.value); setError(""); }} />
            </label>
            <fieldset className="field capture-periods">
              <legend className="field-label">Período</legend>
              <div className="capture-chips">
                {VISIT_PERIODS.map((v) => (
                  <button key={v.value} type="button" className="chip" aria-pressed={period === v.value} onClick={() => setPeriod(v.value)}>
                    {v.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={sending}>
              {sending ? "Enviando…" : "Pedir visita"}
            </button>
          </>
        )}

        {tab === "whatsapp" && (
          <>
            <a className="btn btn--primary btn--lg btn--block" href={waLink(waMessage)} target="_blank" rel="noopener noreferrer" onClick={goWhatsApp}>
              Continuar no WhatsApp <ArrowUpRight size={16} />
            </a>
            <a className="capture-skip" href={waLink(productMessage(p))} target="_blank" rel="noopener noreferrer" onClick={skip}>
              Pular e ir direto para o WhatsApp
            </a>
          </>
        )}
        <p className="capture-note">Seus dados são usados só para o atendimento sobre este imóvel.</p>
      </form>
    </Modal>
  );
}
