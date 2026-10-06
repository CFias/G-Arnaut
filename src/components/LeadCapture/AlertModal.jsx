import { useState } from "react";
import { BellRing, Check } from "lucide-react";
import Modal from "../Modal/Modal";
import { readContact, saveContact } from "./contactMemory";
import { AGENT, CONVERSIONS, NEGOCIOS, TIPOS, negocioLabel } from "../../lib/constants";
import { brlShort, formatPhone, maskMoney, digitsToNumber, phoneDigits } from "../../lib/format";
import { createLead } from "../../services/leads";
import { trackConversion } from "../../gtag";
import "./styles.css";

export function describeWants(w) {
  const parts = [
    w.tipo || "Imóvel",
    w.negocio ? negocioLabel(w.negocio).toLowerCase() : "",
    w.bairro ? `em ${w.bairro}` : "",
    w.quartos ? `${w.quartos}+ quartos` : "",
    w.priceMax ? `até ${brlShort(w.priceMax)}` : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

/**
 * "Me avise quando surgir": guarda a busca do visitante como lead com
 * `wants`. O painel cruza esses leads com cada imóvel novo cadastrado.
 */
export default function AlertModal({ initial = {}, bairros = [], onClose }) {
  const saved = readContact();
  const [name, setName] = useState(saved.name);
  const [phone, setPhone] = useState(formatPhone(saved.phone));
  const [wants, setWants] = useState({
    negocio: initial.negocio || "",
    tipo: initial.tipo || "",
    bairro: initial.bairro || "",
    quartos: initial.quartos || 0,
    priceMax: initial.priceMax || 0,
  });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => {
    setWants((w) => ({ ...w, [k]: v }));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    const digits = phoneDigits(phone);
    if (!name.trim() || digits.length < 10) {
      setError("Informe seu nome e um WhatsApp com DDD para receber o aviso.");
      return;
    }
    setSending(true);
    saveContact({ name: name.trim(), phone: digits });
    const ok = await createLead({
      name: name.trim(),
      phone: digits,
      source: "alerta",
      wants,
      message: `Quer ser avisado: ${describeWants(wants)}`,
    });
    setSending(false);
    if (!ok) {
      setError("Não foi possível salvar agora. Tente de novo ou fale direto pelo WhatsApp.");
      return;
    }
    trackConversion(CONVERSIONS.whatsapp);
    setDone(true);
  };

  if (done) {
    return (
      <Modal title="Pronto, está anotado" onClose={onClose}>
        <div className="capture-done">
          <span className="capture-check"><Check size={22} /></span>
          <p>
            Quando surgir <strong>{describeWants(wants).toLowerCase()}</strong>, {AGENT.firstName} te avisa pelo
            WhatsApp {formatPhone(phoneDigits(phone))}.
          </p>
          <button type="button" className="btn btn--primary btn--block" onClick={onClose}>Continuar navegando</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Me avise quando surgir" subtitle="Muitos imóveis chegam antes de irem para o site." onClose={onClose}>
      <form className="capture-form" onSubmit={submit} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="capture-grid">
          <label className="field">
            <span className="field-label">Negócio</span>
            <select className="select" value={wants.negocio} onChange={(e) => set("negocio", e.target.value)}>
              <option value="">Tanto faz</option>
              {NEGOCIOS.map((n) => <option key={n.key} value={n.key}>{n.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Tipo</span>
            <select className="select" value={wants.tipo} onChange={(e) => set("tipo", e.target.value)}>
              <option value="">Tanto faz</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Bairro</span>
            <input className="input" list="alert-bairros" value={wants.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Tanto faz" />
            <datalist id="alert-bairros">
              {bairros.map((b) => <option key={b} value={b} />)}
            </datalist>
          </label>
          <label className="field">
            <span className="field-label">Quartos</span>
            <select className="select" value={wants.quartos} onChange={(e) => set("quartos", Number(e.target.value))}>
              <option value={0}>Tanto faz</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </label>
          <label className="field capture-full">
            <span className="field-label">Valor máximo (R$)</span>
            <input className="input" inputMode="numeric" value={wants.priceMax ? maskMoney(String(wants.priceMax)) : ""} onChange={(e) => set("priceMax", digitsToNumber(e.target.value))} placeholder="Opcional" />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Seu nome</span>
          <input className="input" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} autoComplete="name" />
        </label>
        <label className="field">
          <span className="field-label">WhatsApp</span>
          <input className="input" value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }} inputMode="tel" autoComplete="tel" placeholder="(71) 99999-9999" />
        </label>
        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={sending}>
          <BellRing size={16} /> {sending ? "Salvando…" : "Quero ser avisado"}
        </button>
        <p className="capture-note">Você recebe o aviso direto do corretor, sem spam. Para sair, é só pedir.</p>
      </form>
    </Modal>
  );
}
