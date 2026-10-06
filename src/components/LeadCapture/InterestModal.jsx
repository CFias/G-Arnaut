import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, Check, MessageCircle } from "lucide-react";
import Modal from "../Modal/Modal";
import { readContact, saveContact } from "./contactMemory";
import { AGENT } from "../../lib/constants";
import { availableDays, bookSlot, fetchBookings } from "../../services/scheduling";
import { formatPhone, phoneDigits } from "../../lib/format";
import { productMessage, trackWhatsApp, waLink } from "../../lib/whatsapp";
import "./styles.css";


/**
 * "Tenho interesse": pede nome e telefone (opcionais) antes de abrir o
 * WhatsApp, ou registra um pedido de visita. `initialTab`: "whatsapp" | "visita".
 */
const fmtDay = (d) => {
  const s = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const fmtTime = (d) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export default function InterestModal({ product: p, initialTab = "whatsapp", schedule = null, onClose }) {
  const saved = readContact();
  const canSchedule = Boolean(schedule?.enabled);
  const [tab, setTab] = useState(canSchedule ? initialTab : "whatsapp");
  const [name, setName] = useState(saved.name);
  const [phone, setPhone] = useState(formatPhone(saved.phone));
  const [booked, setBooked] = useState(null); // Set | null enquanto carrega
  const [dayKey, setDayKey] = useState("");
  const [slot, setSlot] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null); // { when: Date }

  // Reservas existentes: só quando a aba de visita é aberta
  useEffect(() => {
    if (tab !== "visita" || booked) return;
    fetchBookings()
      .then(setBooked)
      .catch(() => setBooked(new Set()));
  }, [tab, booked]);

  const days = useMemo(() => (booked ? availableDays(schedule, booked) : []), [schedule, booked]);
  const selectedDay = days.find((d) => d.key === dayKey) || null;

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
    if (!slot) {
      setError("Escolha o dia e o horário da visita.");
      return;
    }
    setSending(true);
    try {
      await bookSlot(slot);
    } catch {
      setSending(false);
      setSlot(null);
      setBooked(null); // recarrega os horários
      setError("Esse horário acabou de ser reservado. Escolha outro, por favor.");
      return;
    }
    remember();
    trackWhatsApp({
      product: p,
      name: name.trim(),
      phone: digits,
      source: "visita",
      visitAt: slot,
      visitPeriod: "",
      message: `Visita agendada pelo site: ${slot.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`,
    });
    setSending(false);
    setDone({ when: slot });
  };

  if (done) {
    const when = `${done.when.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}, às ${fmtTime(done.when)}`;
    const msg = `Olá, ${AGENT.firstName}! Agendei pelo site uma visita ao imóvel ${p.code} — ${p.title} para ${when}.`;
    return (
      <Modal title="Visita agendada" onClose={onClose}>
        <div className="capture-done">
          <span className="capture-check"><Check size={22} /></span>
          <p>
            <strong>{when.charAt(0).toUpperCase() + when.slice(1)}</strong>. {AGENT.firstName} vai confirmar com você
            pelo telefone {formatPhone(digits)}. Se quiser, avise agora pelo WhatsApp.
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
      {canSchedule && (
        <div className="capture-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "whatsapp"} className={tab === "whatsapp" ? "is-on" : ""} onClick={() => { setTab("whatsapp"); setError(""); }}>
            <MessageCircle size={15} /> Conversar
          </button>
          <button type="button" role="tab" aria-selected={tab === "visita"} className={tab === "visita" ? "is-on" : ""} onClick={() => { setTab("visita"); setError(""); }}>
            <CalendarDays size={15} /> Agendar visita
          </button>
        </div>
      )}

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
            {!booked ? (
              <p className="muted capture-loading">Carregando horários…</p>
            ) : days.length === 0 ? (
              <p className="capture-empty">
                Não há horários livres nos próximos dias. Fale pelo WhatsApp que {AGENT.firstName} encontra um horário com você.
              </p>
            ) : (
              <>
                <fieldset className="field capture-periods">
                  <legend className="field-label">Dia</legend>
                  <div className="capture-days">
                    {days.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        className="chip"
                        aria-pressed={dayKey === d.key}
                        onClick={() => { setDayKey(d.key); setSlot(null); setError(""); }}
                      >
                        {fmtDay(d.date)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {selectedDay && (
                  <fieldset className="field capture-periods">
                    <legend className="field-label">Horário</legend>
                    <div className="capture-chips">
                      {selectedDay.slots.map((t) => (
                        <button
                          key={t.getTime()}
                          type="button"
                          className="chip"
                          aria-pressed={slot?.getTime() === t.getTime()}
                          onClick={() => { setSlot(t); setError(""); }}
                        >
                          {fmtTime(t)}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={sending || !slot}>
                  {sending ? "Agendando…" : slot ? `Agendar ${fmtDay(slot)}, ${fmtTime(slot)}` : "Escolha um horário"}
                </button>
              </>
            )}
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
