import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarCheck, Trash2, X } from "lucide-react";
import { Dialog } from "@mui/material";
import { useToast } from "../../contexts/ToastContext";
import {
  addLeadNote,
  completeFollowUp,
  createManualLead,
  deleteLead,
  saveLead,
} from "../../services/leads";
import { LEAD_SOURCES, LEAD_STAGES, NEGOCIOS, TIPOS, leadSourceLabel } from "../../lib/constants";
import {
  EMPTY_WANTS,
  hasWants,
  leadScore,
  leadWants,
  matchingProducts,
  scoreLevel,
  visitPeriodLabel,
} from "../../lib/crm";
import {
  brlShort,
  digitsToNumber,
  maskMoney,
  followUpLabel,
  followUpState,
  formatPhone,
  fromLocalInput,
  phoneDigits,
  relativeDate,
  toLocalInput,
  waPhone,
} from "../../lib/format";
import { productUrl, waLink } from "../../lib/whatsapp";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  source: "indicacao",
  stage: "Novo",
  productId: "",
  followUp: "",
  firstNote: "",
  wants: EMPTY_WANTS,
};

function formFromLead(l) {
  return {
    name: l.hasName ? l.name : "",
    phone: formatPhone(l.phone),
    email: l.email,
    source: l.source,
    stage: l.stage,
    productId: l.productId || "",
    followUp: toLocalInput(l.followUpAt),
    firstNote: "",
    wants: { ...EMPTY_WANTS, ...(l.wants || {}) },
  };
}

/**
 * Painel lateral do lead: criar (lead = null) ou ver/editar.
 * onSaved(lead) devolve o lead atualizado; onDeleted(id) após excluir.
 */
export default function LeadDrawer({ lead, products, onClose, onSaved, onDeleted }) {
  const isNew = !lead;
  const toast = useToast();
  const [form, setForm] = useState(() => (lead ? formFromLead(lead) : EMPTY));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const firstField = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const confirmRef = useRef(confirmDelete);
  confirmRef.current = confirmDelete;

  // Esc fecha, trava o scroll da página e foca o primeiro campo (uma vez)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !confirmRef.current && closeRef.current();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!lead) firstField.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productOptions = useMemo(
    () => [...products].sort((a, b) => a.title.localeCompare(b.title, "pt-BR")),
    [products],
  );
  const product = products.find((p) => p.id === form.productId) || null;

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const dirty = isNew || JSON.stringify(form) !== JSON.stringify(formFromLead(lead));

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim() && !phoneDigits(form.phone)) {
      setError("Informe ao menos o nome ou o telefone.");
      return;
    }
    const payload = {
      ...form,
      followUpAt: fromLocalInput(form.followUp),
      wants: hasWants(form.wants) ? form.wants : null,
    };
    // Lead antigo vindo do site guardava só o título do imóvel: preserva se não trocar
    const prod = product || (lead && form.productId === (lead.productId || "") && lead.productId
      ? { id: lead.productId, title: lead.productTitle, code: lead.productCode }
      : null);
    setSaving(true);
    try {
      const saved = isNew ? await createManualLead(payload, prod) : await saveLead(lead, payload, prod);
      toast(isNew ? "Lead cadastrado" : "Lead atualizado");
      onSaved(saved, isNew);
      if (isNew) onClose();
      else setForm(formFromLead(saved));
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar. Verifique a conexão e as regras do Firestore.");
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      onSaved(await addLeadNote(lead, note));
      setNote("");
    } catch (err) {
      console.error(err);
      toast("Não foi possível salvar a anotação");
    } finally {
      setSaving(false);
    }
  };

  const finishFollowUp = async () => {
    setSaving(true);
    try {
      const saved = await completeFollowUp(lead);
      onSaved(saved);
      setForm(formFromLead(saved));
      toast("Retorno marcado como feito");
    } catch (err) {
      console.error(err);
      toast("Não foi possível atualizar o retorno");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    setSaving(true);
    try {
      await deleteLead(lead.id);
      toast("Lead excluído");
      onDeleted(lead.id);
      onClose();
    } catch (err) {
      console.error(err);
      toast("Não foi possível excluir o lead");
      setSaving(false);
    }
  };

  const setWant = (k, v) => set("wants", { ...form.wants, [k]: v });
  const bairros = useMemo(
    () => [...new Set(products.map((p) => p.neighborhood).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );
  const matches = useMemo(() => (lead ? matchingProducts(lead, products).slice(0, 6) : []), [lead, products]);
  const inferred = lead && !hasWants(lead.wants) ? leadWants(lead, products) : null;
  const score = lead ? leadScore(lead) : null;
  const level = scoreLevel(score);

  const fState = lead ? followUpState(lead.followUpAt) : null;
  const phone = waPhone(form.phone);

  return createPortal(
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="lead-title">
        <header className="drawer-head">
          <div className="drawer-title">
            <h2 id="lead-title">{isNew ? "Novo lead" : lead.name}</h2>
            {!isNew && (
              <span className="muted small">
                {leadSourceLabel(lead.source)} · entrou {relativeDate(lead.createdAt).toLowerCase()}
                {level && (
                  <>
                    {" · "}
                    <span className={`score score--${level.key}`}>{level.label} · {score}</span>
                  </>
                )}
              </span>
            )}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <div className="drawer-body">
          {!isNew && fState && (
            <div className={`followup-banner followup-banner--${fState}`}>
              <span>{followUpLabel(lead.followUpAt)}</span>
              <button type="button" className="btn btn--outline btn--sm" onClick={finishFollowUp} disabled={saving}>
                <CalendarCheck size={15} /> Marcar como feito
              </button>
            </div>
          )}

          {!isNew && lead.visitAt && (
            <div className="followup-banner followup-banner--visita">
              <span>
                Pediu visita para{" "}
                {lead.visitAt.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                {lead.visitPeriod ? ` (${visitPeriodLabel(lead.visitPeriod).toLowerCase()})` : ""}
              </span>
            </div>
          )}

          {!isNew && lead.message && (
            <div className="lead-origin-msg">
              <span className="field-label">Mensagem enviada pelo site</span>
              <p>{lead.message}</p>
            </div>
          )}

          <form id="lead-form" className="drawer-form" onSubmit={submit} noValidate>
            {error && <div className="form-error" role="alert">{error}</div>}
            <label className="field field--full">
              <span className="field-label">Nome</span>
              <input ref={firstField} className="input input--soft" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome do cliente" autoComplete="off" />
            </label>
            <label className="field">
              <span className="field-label">Telefone / WhatsApp</span>
              <input
                className="input input--soft"
                value={form.phone}
                onChange={(e) => set("phone", formatPhone(e.target.value))}
                placeholder="(71) 99999-9999"
                inputMode="tel"
                autoComplete="off"
              />
            </label>
            <label className="field">
              <span className="field-label">E-mail</span>
              <input className="input input--soft" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="opcional" autoComplete="off" />
            </label>
            <label className="field">
              <span className="field-label">Etapa</span>
              <select className="select input--soft" value={form.stage} onChange={(e) => set("stage", e.target.value)}>
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Origem</span>
              <select className="select input--soft" value={form.source} onChange={(e) => set("source", e.target.value)}>
                {LEAD_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span className="field-label">Imóvel de interesse</span>
              <select className="select input--soft" value={form.productId} onChange={(e) => set("productId", e.target.value)}>
                <option value="">Nenhum / ainda não definido</option>
                {lead?.productId && !products.some((p) => p.id === lead.productId) && (
                  <option value={lead.productId}>{lead.productTitle || "Imóvel removido"}</option>
                )}
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} · {p.title}</option>
                ))}
              </select>
              {form.productId && (
                <Link to={`/product/${form.productId}`} target="_blank" rel="noopener noreferrer" className="field-hint field-link">
                  Abrir página do imóvel ↗
                </Link>
              )}
            </label>
            <label className="field field--full">
              <span className="field-label">Próximo retorno</span>
              <span className="followup-input">
                <input className="input input--soft" type="datetime-local" value={form.followUp} onChange={(e) => set("followUp", e.target.value)} />
                {form.followUp && (
                  <button type="button" className="link-btn" onClick={() => set("followUp", "")}>
                    Limpar
                  </button>
                )}
              </span>
              <span className="field-hint">Leads com retorno vencido aparecem em destaque na lista e na visão geral.</span>
            </label>
            <fieldset className="field--full wants">
              <legend className="field-label">
                O que procura
                {inferred && <small className="muted"> — deduzido do imóvel de interesse, ajuste se quiser</small>}
              </legend>
              <div className="wants-grid">
                <select className="select input--soft input--sm" aria-label="Negócio" value={form.wants.negocio} onChange={(e) => setWant("negocio", e.target.value)}>
                  <option value="">Negócio: tanto faz</option>
                  {NEGOCIOS.map((n) => <option key={n.key} value={n.key}>{n.label}</option>)}
                </select>
                <select className="select input--soft input--sm" aria-label="Tipo" value={form.wants.tipo} onChange={(e) => setWant("tipo", e.target.value)}>
                  <option value="">Tipo: tanto faz</option>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className="input input--soft input--sm" list="lead-bairros" aria-label="Bairro" placeholder="Bairro: tanto faz" value={form.wants.bairro} onChange={(e) => setWant("bairro", e.target.value)} />
                <datalist id="lead-bairros">{bairros.map((b) => <option key={b} value={b} />)}</datalist>
                <select className="select input--soft input--sm" aria-label="Quartos" value={form.wants.quartos} onChange={(e) => setWant("quartos", Number(e.target.value))}>
                  <option value={0}>Quartos: tanto faz</option>
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ quartos</option>)}
                </select>
                <input
                  className="input input--soft input--sm wants-price"
                  inputMode="numeric"
                  aria-label="Valor máximo"
                  placeholder={inferred?.priceMax ? `Até R$ ${maskMoney(String(inferred.priceMax))}` : "Valor máximo (R$)"}
                  value={form.wants.priceMax ? maskMoney(String(form.wants.priceMax)) : ""}
                  onChange={(e) => setWant("priceMax", digitsToNumber(e.target.value))}
                />
              </div>
            </fieldset>
            {isNew && (
              <label className="field field--full">
                <span className="field-label">Anotação inicial</span>
                <textarea className="textarea input--soft" rows={3} value={form.firstNote} onChange={(e) => set("firstNote", e.target.value)} placeholder="O que o cliente procura, orçamento, prazo…" />
              </label>
            )}
          </form>

          {!isNew && (
            <section className="matches">
              <h3>Imóveis que combinam <span className="muted small">({matches.length})</span></h3>
              {matches.length === 0 ? (
                <p className="muted small">
                  {leadWants(lead, products) ? "Nenhum imóvel publicado combina com o que ele procura agora." : "Preencha “O que procura” para ver sugestões."}
                </p>
              ) : (
                <ul className="match-list">
                  {matches.map((m) => (
                    <li key={m.id} className="match">
                      <div className="match-img img-placeholder">{m.cover && <img src={m.cover} alt="" loading="lazy" />}</div>
                      <div className="match-text">
                        <strong className="text-ellipsis">{m.title}</strong>
                        <small>{m.code} · {m.neighborhood} · {m.price ? brlShort(m.price) : "sob consulta"}</small>
                      </div>
                      {phone && (
                        <a
                          className="btn btn--outline btn--sm"
                          href={waLink(`Olá${lead.hasName ? `, ${lead.name.split(" ")[0]}` : ""}! Separei este imóvel que combina com o que você procura: ${m.title}.\n${productUrl(m.id)}`, phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Enviar
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {!isNew && (
            <section className="notes">
              <h3>Histórico</h3>
              <div className="note-add">
                <textarea
                  className="textarea input--soft"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Escreva uma anotação: o que conversaram, próximos passos…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
                  }}
                />
                <button type="button" className="btn btn--outline btn--sm" onClick={addNote} disabled={saving || !note.trim()}>
                  Adicionar anotação
                </button>
              </div>
              {lead.notes.length === 0 && !lead.createdAt ? (
                <p className="muted small">Nenhuma anotação ainda.</p>
              ) : (
                <ol className="timeline">
                  {lead.notes.map((n) => (
                    <li key={n.id} className={`timeline-item timeline-item--${n.kind}`}>
                      <span className="timeline-dot" aria-hidden="true" />
                      <div>
                        <p>{n.text}</p>
                        <time className="muted small">{relativeDate(n.at)}</time>
                      </div>
                    </li>
                  ))}
                  {lead.createdAt && (
                    <li className="timeline-item timeline-item--system">
                      <span className="timeline-dot" aria-hidden="true" />
                      <div>
                        <p>Lead criado · {leadSourceLabel(lead.source)}</p>
                        <time className="muted small">{relativeDate(lead.createdAt)}</time>
                      </div>
                    </li>
                  )}
                </ol>
              )}
            </section>
          )}
        </div>

        <footer className="drawer-foot">
          {!isNew && (
            <button type="button" className="icon-btn icon-btn--danger" onClick={() => setConfirmDelete(true)} aria-label="Excluir lead" title="Excluir lead" disabled={saving}>
              <Trash2 size={16} />
            </button>
          )}
          {phone && (
            <a className="btn btn--outline" href={waLink("", phone)} target="_blank" rel="noopener noreferrer">
              WhatsApp <ArrowUpRight size={15} />
            </a>
          )}
          <button type="submit" form="lead-form" className="btn btn--primary drawer-save" disabled={saving || !dirty}>
            {saving ? "Salvando…" : isNew ? "Cadastrar lead" : "Salvar"}
          </button>
        </footer>
      </aside>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth aria-labelledby="del-lead">
        <div className="confirm">
          <h2 id="del-lead">Excluir este lead?</h2>
          <p>O contato e todo o histórico de anotações serão apagados. Para tirar da lista sem perder o histórico, mude a etapa para “Fechado”.</p>
          <div className="confirm-actions">
            <button type="button" className="btn btn--outline" onClick={() => setConfirmDelete(false)}>Cancelar</button>
            <button type="button" className="btn btn--danger" onClick={remove}><Trash2 size={15} /> Excluir</button>
          </div>
        </div>
      </Dialog>
    </>,
    document.body,
  );
}
