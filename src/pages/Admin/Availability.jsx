import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import {
  DEFAULT_SCHEDULE,
  WEEKDAYS,
  availableDays,
  cancelBooking,
  fetchAllBookings,
  fetchSchedule,
  saveSchedule,
} from "../../services/scheduling";

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // segunda primeiro

const clone = (s) => JSON.parse(JSON.stringify(s));

/** Configuração do agendamento de visitas pelo site. */
export default function Availability() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState("");
  const [bookings, setBookings] = useState([]);
  const [blockInput, setBlockInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSchedule({ force: true })
      .then((s) => {
        const base = s._missing ? clone(DEFAULT_SCHEDULE) : clone(s);
        delete base._missing;
        setForm(base);
        setInitial(JSON.stringify(base));
      })
      .catch((e) => {
        console.error(e);
        setError("Não foi possível ler a configuração. Confira as regras do Firestore (settings).");
        setForm(clone(DEFAULT_SCHEDULE));
      });
    fetchAllBookings()
      .then((list) => setBookings(list.filter((b) => b.at && b.at > new Date()).sort((a, b) => a.at - b.at)))
      .catch(() => { });
  }, []);

  const booked = useMemo(() => new Set(bookings.map((b) => b.id)), [bookings]);
  const preview = useMemo(() => (form ? availableDays({ ...form, enabled: true }, booked) : []), [form, booked]);

  const release = async (b) => {
    try {
      await cancelBooking(b.at);
      setBookings((list) => list.filter((x) => x.id !== b.id));
      toast("Horário liberado");
    } catch (e) {
      console.error(e);
      toast("Não foi possível liberar o horário");
    }
  };

  if (!form) return <div className="admin-loading">Carregando disponibilidade…</div>;

  const dirty = JSON.stringify(form) !== initial;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setRanges = (day, ranges) => setForm((f) => ({ ...f, week: { ...f.week, [day]: ranges } }));

  const toggleDay = (day) =>
    setRanges(day, form.week[day].length ? [] : [{ start: "09:00", end: "12:00" }]);
  const updateRange = (day, i, k, v) =>
    setRanges(day, form.week[day].map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addRange = (day) => {
    const last = form.week[day][form.week[day].length - 1];
    setRanges(day, [...form.week[day], last ? { start: last.end, end: last.end < "18:00" ? "18:00" : "20:00" } : { start: "14:00", end: "18:00" }]);
  };
  const removeRange = (day, i) => setRanges(day, form.week[day].filter((_, j) => j !== i));

  const addBlocked = () => {
    if (!blockInput || form.blockedDates.includes(blockInput)) return;
    set("blockedDates", [...form.blockedDates, blockInput].sort());
    setBlockInput("");
  };

  const invalid = ORDER.some((d) => form.week[d].some((r) => !r.start || !r.end || r.end <= r.start));

  const save = async (nextEnabled = form.enabled) => {
    if (invalid) {
      setError("Há intervalos com horário de fim antes do início. Corrija antes de salvar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = await saveSchedule({ ...form, enabled: nextEnabled });
      setForm(clone(saved));
      setInitial(JSON.stringify(saved));
      toast(nextEnabled ? "Agendamento ativo no site" : "Agendamento desativado no site");
    } catch (e) {
      console.error(e);
      setError("Não foi possível salvar. Confira as regras do Firestore (settings).");
    } finally {
      setSaving(false);
    }
  };

  const totalSlots = preview.reduce((a, d) => a + d.slots.length, 0);

  return (
    <div className="admin-stack">
      {error && <div className="form-error" role="alert">{error}</div>}

      <section className={`admin-card avail-status${form.enabled ? " is-on" : ""}`}>
        <div>
          <strong>{form.enabled ? "Agendamento ativo no site" : "Agendamento desativado"}</strong>
          <span className="muted small">
            {form.enabled
              ? `Os visitantes veem “Agendar visita” nos imóveis e escolhem entre ${totalSlots} horários livres.`
              : "O botão “Agendar visita” não aparece no site. Os visitantes só podem chamar no WhatsApp."}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          className="switch switch--gold"
          aria-checked={form.enabled}
          aria-label="Ativar agendamento pelo site"
          disabled={saving}
          onClick={() => save(!form.enabled)}
        />
      </section>

      <section className="form-section">
        <div className="form-section-head">
          <span className="form-step">01</span>
          <div>
            <h2>Regras</h2>
            <p>Valem para todos os imóveis.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">Duração de cada visita</span>
            <select className="select input--soft" value={form.slotMinutes} onChange={(e) => set("slotMinutes", Number(e.target.value))}>
              {[[30, "30 min"], [45, "45 min"], [60, "1 hora"], [90, "1h30"], [120, "2 horas"]].map(([m, l]) => (
                <option key={m} value={m}>{l}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Antecedência mínima</span>
            <select className="select input--soft" value={form.minNoticeHours} onChange={(e) => set("minNoticeHours", Number(e.target.value))}>
              {[0, 2, 6, 12, 24, 48].map((h) => <option key={h} value={h}>{h ? `${h} horas` : "Sem antecedência"}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Mostrar horários até</span>
            <select className="select input--soft" value={form.maxDaysAhead} onChange={(e) => set("maxDaysAhead", Number(e.target.value))}>
              {[7, 14, 21, 30, 60].map((d) => <option key={d} value={d}>{d} dias à frente</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-head">
          <span className="form-step">02</span>
          <div>
            <h2>Dias e horários</h2>
            <p>Só os intervalos definidos aqui ficam disponíveis para os visitantes.</p>
          </div>
        </div>
        <div className="week">
          {ORDER.map((d) => {
            const open = form.week[d].length > 0;
            return (
              <div key={d} className={`week-row${open ? "" : " is-closed"}`}>
                <div className="week-day">
                  <button
                    type="button"
                    role="switch"
                    className="switch"
                    aria-checked={open}
                    aria-label={`${WEEKDAYS[d]} aberto`}
                    onClick={() => toggleDay(d)}
                  />
                  <strong>{WEEKDAYS[d]}</strong>
                </div>
                <div className="week-ranges">
                  {!open && <span className="muted small">Fechado</span>}
                  {form.week[d].map((r, i) => (
                    <div key={i} className="range">
                      <input
                        type="time"
                        className="input input--soft input--sm"
                        value={r.start}
                        step={900}
                        onChange={(e) => updateRange(d, i, "start", e.target.value)}
                        aria-label={`${WEEKDAYS[d]} início ${i + 1}`}
                        aria-invalid={r.end <= r.start ? "true" : undefined}
                      />
                      <span className="muted">até</span>
                      <input
                        type="time"
                        className="input input--soft input--sm"
                        value={r.end}
                        step={900}
                        onChange={(e) => updateRange(d, i, "end", e.target.value)}
                        aria-label={`${WEEKDAYS[d]} fim ${i + 1}`}
                        aria-invalid={r.end <= r.start ? "true" : undefined}
                      />
                      <button type="button" className="icon-btn icon-btn--sm" onClick={() => removeRange(d, i)} aria-label="Remover intervalo">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {open && (
                    <button type="button" className="link-btn" onClick={() => addRange(d)}>
                      <Plus size={13} /> intervalo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-head">
          <span className="form-step">03</span>
          <div>
            <h2>Datas bloqueadas</h2>
            <p>Feriados, viagens ou dias em que você não vai atender.</p>
          </div>
        </div>
        <div className="blocked-add">
          <input type="date" className="input input--soft input--sm" value={blockInput} onChange={(e) => setBlockInput(e.target.value)} aria-label="Data a bloquear" />
          <button type="button" className="btn btn--outline btn--sm" onClick={addBlocked} disabled={!blockInput}>
            Bloquear data
          </button>
        </div>
        {form.blockedDates.length > 0 && (
          <div className="blocked-list">
            {form.blockedDates.map((k) => {
              const [y, m, dd] = k.split("-").map(Number);
              const label = new Date(y, m - 1, dd).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
              return (
                <button key={k} type="button" className="chip chip--soft" onClick={() => set("blockedDates", form.blockedDates.filter((x) => x !== k))} aria-label={`Desbloquear ${label}`}>
                  {label} <X size={13} />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>Como o visitante vai ver</h2>
          <span className="muted small">{totalSlots} horários livres em {preview.length} dias</span>
        </div>
        {preview.length === 0 ? (
          <p className="admin-empty">Nenhum horário livre com essa configuração.</p>
        ) : (
          <div className="preview-days">
            {preview.slice(0, 6).map((d) => (
              <div key={d.key} className="preview-day">
                <strong>{d.date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "")}</strong>
                <span>{d.slots.map((t) => t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })).join(" · ")}</span>
              </div>
            ))}
            {preview.length > 6 && <span className="muted small">e mais {preview.length - 6} dias…</span>}
          </div>
        )}
      </section>

      {bookings.length > 0 && (
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Horários reservados</h2>
            <span className="muted small">Para cancelar uma visita com o histórico, use a ficha do lead</span>
          </div>
          <ul className="booked-list">
            {bookings.map((b) => (
              <li key={b.id}>
                <span>
                  {b.at.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "")},{" "}
                  {b.at.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button type="button" className="link-btn" onClick={() => release(b)}>
                  Liberar horário
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="form-actions">
        {dirty && <span className="form-progress">Alterações não salvas</span>}
        <button type="button" className="btn btn--primary" onClick={() => save()} disabled={saving || !dirty}>
          {saving ? "Salvando…" : "Salvar disponibilidade"}
        </button>
      </div>
    </div>
  );
}
