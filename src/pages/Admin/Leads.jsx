import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { updateLeadStage } from "../../services/leads";
import { LEAD_STAGES } from "../../lib/constants";
import { initials, normalizeText, relativeDate } from "../../lib/format";
import { waLink } from "../../lib/whatsapp";

const slug = (s) => normalizeText(s).replace(/\s+/g, "-");
const SOURCE = { whatsapp: "Clique no WhatsApp", form: "Formulário de contato" };

export function LeadCard({ lead, compact = false, onStage }) {
  return (
    <article className={`lead${compact ? " lead--compact" : ""}`}>
      <span className="lead-avatar" aria-hidden="true">{initials(lead.name)}</span>
      <div className="lead-body">
        <div className="lead-top">
          <strong className="text-ellipsis">{lead.name}</strong>
          <span className="lead-date">{relativeDate(lead.createdAt)}</span>
        </div>
        {lead.productId ? (
          <Link to={`/product/${lead.productId}`} className="lead-product text-ellipsis" target="_blank" rel="noopener noreferrer">
            {lead.productCode ? `${lead.productCode} · ` : ""}
            {lead.productTitle || "Ver imóvel"}
          </Link>
        ) : (
          <span className="lead-product muted">{SOURCE[lead.source] || "Contato geral"}</span>
        )}
        {!compact && lead.message && <p className="lead-msg">{lead.message}</p>}
      </div>

      {compact ? (
        <span className={`pill pill--${slug(lead.stage)}`}>{lead.stage}</span>
      ) : (
        <div className="lead-actions">
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
          {lead.phone ? (
            <a className="btn btn--outline btn--sm" href={waLink("", lead.phone.replace(/\D/g, ""))} target="_blank" rel="noopener noreferrer">
              Responder <ArrowUpRight size={14} />
            </a>
          ) : (
            <span className="lead-hint">A conversa está no seu WhatsApp</span>
          )}
        </div>
      )}
    </article>
  );
}

export default function Leads() {
  const { leads, setLeads, leadsState, reloadLeads } = useOutletContext();
  const toast = useToast();
  const [filter, setFilter] = useState("Todos");

  const changeStage = async (lead, stage) => {
    const prev = lead.stage;
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, stage } : l)));
    try {
      await updateLeadStage(lead.id, stage);
      toast(`${lead.name.split(" ")[0]}: ${stage.toLowerCase()}`);
    } catch (e) {
      console.error(e);
      setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, stage: prev } : l)));
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

  const filtered = filter === "Todos" ? leads : leads.filter((l) => l.stage === filter);

  return (
    <div className="admin-stack">
      <div className="funnel" role="group" aria-label="Filtrar por etapa">
        {["Todos", ...LEAD_STAGES].map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s}
            <span className="funnel-n">{s === "Todos" ? leads.length : leads.filter((l) => l.stage === s).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <section className="admin-card">
          <p className="admin-empty">
            {leads.length
              ? "Nenhum lead nesta etapa."
              : "Ainda não há leads. Eles aparecem aqui quando alguém clica em “Tenho interesse” num imóvel ou envia o formulário de contato."}
          </p>
        </section>
      ) : (
        <div className="lead-grid">
          {filtered.map((l) => (
            <LeadCard key={l.id} lead={l} onStage={changeStage} />
          ))}
        </div>
      )}
    </div>
  );
}
