import { useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Phone, Plus, Search } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { updateLeadStage } from "../../services/leads";
import LeadDrawer from "./LeadDrawer";
import { LEAD_STAGES, leadSourceLabel } from "../../lib/constants";
import {
  followUpLabel,
  followUpState,
  formatPhone,
  initials,
  normalizeText,
  relativeDate,
  waPhone,
} from "../../lib/format";
import { waLink } from "../../lib/whatsapp";
import { leadScore, scoreLevel, visitPeriodLabel } from "../../lib/crm";

const slug = (s) => normalizeText(s).replace(/\s+/g, "-");

/** Retornos que pedem ação: vencidos ou para hoje. */
export const isDue = (l) => ["atrasado", "hoje"].includes(followUpState(l.followUpAt)) && l.stage !== "Fechado";

export function LeadCard({ lead, compact = false, onStage, onOpen }) {
  const fState = followUpState(lead.followUpAt);
  const lastNote = lead.notes.find((n) => n.kind === "note");

  const product = lead.productId ? (
    <Link
      to={`/product/${lead.productId}`}
      className="lead-product text-ellipsis"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {lead.productCode ? `${lead.productCode} · ` : ""}
      {lead.productTitle || "Ver imóvel"}
    </Link>
  ) : (
    <span className="lead-product muted">{leadSourceLabel(lead.source)}</span>
  );

  if (compact) {
    return (
      <article className="lead lead--compact">
        <span className="lead-avatar" aria-hidden="true">{initials(lead.name)}</span>
        <div className="lead-body">
          <div className="lead-top">
            <strong className="text-ellipsis">{lead.name}</strong>
            <span className="lead-date">{relativeDate(lead.createdAt)}</span>
          </div>
          {product}
        </div>
        <span className={`pill pill--${slug(lead.stage)}`}>{lead.stage}</span>
      </article>
    );
  }

  const phone = waPhone(lead.phone);
  const level = scoreLevel(leadScore(lead));

  return (
    <article
      className={`lead lead--card${fState === "atrasado" && lead.stage !== "Fechado" ? " is-overdue" : ""}`}
      onClick={() => onOpen(lead)}
      onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onOpen(lead)}
      role="button"
      tabIndex={0}
      aria-label={`Abrir lead ${lead.name}`}
    >
      <span className="lead-avatar" aria-hidden="true">{initials(lead.name)}</span>
      <div className="lead-body">
        <div className="lead-top">
          <strong className="text-ellipsis">
            {level && <span className={`score-dot score-dot--${level.key}`} title={`Lead ${level.label.toLowerCase()}`} />}
            {lead.name}
          </strong>
          <span className="lead-date">{relativeDate(lead.createdAt)}</span>
        </div>
        {product}
        {lead.visitAt && lead.stage !== "Fechado" && (
          <span className="followup-tag followup-tag--visita">
            Visita: {lead.visitAt.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "")}
            {lead.visitPeriod
              ? ` · ${visitPeriodLabel(lead.visitPeriod).toLowerCase()}`
              : ` · ${lead.visitAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
          </span>
        )}
        {lead.phone && (
          <span className="lead-phone">
            <Phone size={12} /> {formatPhone(lead.phone)}
          </span>
        )}
        {fState && lead.stage !== "Fechado" && (
          <span className={`followup-tag followup-tag--${fState}`}>{followUpLabel(lead.followUpAt)}</span>
        )}
        {lastNote ? (
          <p className="lead-msg">“{lastNote.text}”</p>
        ) : (
          lead.message && <p className="lead-msg">{lead.message}</p>
        )}
      </div>

      <div className="lead-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <select
          className={`status-select pill pill--${slug(lead.stage)}`}
          value={lead.stage}
          onChange={(e) => onStage(lead, e.target.value)}
          aria-label={`Etapa de ${lead.name}`}
        >
          {LEAD_STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {phone ? (
          <a className="btn btn--outline btn--sm" href={waLink("", phone)} target="_blank" rel="noopener noreferrer">
            Responder <ArrowUpRight size={14} />
          </a>
        ) : (
          <button type="button" className="link-btn" onClick={() => onOpen(lead)}>
            Adicionar telefone
          </button>
        )}
      </div>
    </article>
  );
}

export default function Leads() {
  const { leads, setLeads, leadsState, reloadLeads, products } = useOutletContext();
  const toast = useToast();
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get("filtro") === "retornos" ? "Retornos" : "Todos");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null); // id | "novo" | null
  const [sort, setSort] = useState("recentes");

  const counts = useMemo(() => {
    const c = { Todos: leads.length, Retornos: leads.filter(isDue).length };
    LEAD_STAGES.forEach((s) => {
      c[s] = leads.filter((l) => l.stage === s).length;
    });
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = normalizeText(search.trim());
    const qDigits = search.replace(/\D/g, "");
    let list = leads.filter((l) => {
      if (filter === "Retornos" && !isDue(l)) return false;
      if (filter !== "Todos" && filter !== "Retornos" && l.stage !== filter) return false;
      if (!q) return true;
      return (
        normalizeText(`${l.name} ${l.email} ${l.productTitle} ${l.productCode}`).includes(q) ||
        (qDigits.length >= 3 && l.phone.includes(qDigits))
      );
    });
    if (filter === "Retornos") list = [...list].sort((a, b) => a.followUpAt - b.followUpAt);
    else if (sort === "quentes") list = [...list].sort((a, b) => (leadScore(b) ?? -1) - (leadScore(a) ?? -1));
    return list;
  }, [leads, filter, search, sort]);

  const replaceLead = (saved, isNew) =>
    setLeads((list) => (isNew ? [saved, ...list] : list.map((l) => (l.id === saved.id ? saved : l))));

  const changeStage = async (lead, stage) => {
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, stage } : l)));
    try {
      replaceLead(await updateLeadStage(lead, stage));
      toast(`${lead.name.split(" ")[0]}: ${stage.toLowerCase()}`);
    } catch (e) {
      console.error(e);
      setLeads((list) => list.map((l) => (l.id === lead.id ? lead : l)));
      toast("Não foi possível mudar a etapa");
    }
  };

  if (leadsState.loading) return <div className="admin-loading">Carregando leads…</div>;

  if (leadsState.error) {
    return (
      <section className="admin-card">
        <p className="admin-empty">
          Não foi possível ler a coleção <code>leads</code>. Provavelmente as regras do Firestore ainda não liberam essa
          coleção — veja o arquivo FIRESTORE_RULES.md do projeto.
        </p>
        <button type="button" className="btn btn--outline btn--sm" onClick={reloadLeads}>
          Tentar de novo
        </button>
      </section>
    );
  }

  const openLead = openId && openId !== "novo" ? leads.find((l) => l.id === openId) : null;

  return (
    <div className="admin-stack">
      <div className="leads-toolbar">
        <label className="table-search leads-search">
          <Search size={15} />
          <span className="visually-hidden">Buscar lead</span>
          <input
            className="input input--sm"
            placeholder="Nome, telefone, e-mail ou imóvel"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select className="select input--sm leads-sort" aria-label="Ordenar" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="quentes">Mais quentes</option>
        </select>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setOpenId("novo")}>
          <Plus size={15} /> Novo lead
        </button>
      </div>

      <div className="funnel" role="group" aria-label="Filtrar">
        {["Todos", "Retornos", ...LEAD_STAGES].map((s) => (
          <button
            key={s}
            type="button"
            className={`chip${s === "Retornos" && counts.Retornos ? " chip--due" : ""}`}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
          >
            {s === "Retornos" ? "Retornos pendentes" : s}
            <span className="funnel-n">{counts[s]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <section className="admin-card">
          <p className="admin-empty">
            {search
              ? "Nenhum lead encontrado com essa busca."
              : filter === "Retornos"
                ? "Nenhum retorno vencido ou para hoje."
                : leads.length
                  ? "Nenhum lead nesta etapa."
                  : "Ainda não há leads. Eles aparecem aqui quando alguém clica em “Tenho interesse” num imóvel ou envia o formulário de contato — ou cadastre um em “Novo lead”."}
          </p>
        </section>
      ) : (
        <div className="lead-grid">
          {filtered.map((l) => (
            <LeadCard key={l.id} lead={l} onStage={changeStage} onOpen={(x) => setOpenId(x.id)} />
          ))}
        </div>
      )}

      {openId && (openId === "novo" || openLead) && (
        <LeadDrawer
          key={openId}
          lead={openLead}
          products={products}
          onClose={() => setOpenId(null)}
          onSaved={replaceLead}
          onDeleted={(id) => setLeads((list) => list.filter((l) => l.id !== id))}
        />
      )}
    </div>
  );
}
