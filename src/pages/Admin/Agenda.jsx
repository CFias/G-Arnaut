import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchOwners } from "../../services/owners";
import { CalendarDays, Phone } from "lucide-react";
import LeadDrawer from "./LeadDrawer";
import { visitPeriodLabel } from "../../lib/crm";
import { formatPhone } from "../../lib/format";

const DAY = 86400000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function dayTitle(date, today) {
  const diff = Math.round((startOfDay(date) - today) / DAY);
  const label = date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  if (diff === 0) return `Hoje · ${label}`;
  if (diff === 1) return `Amanhã · ${label}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Agenda de retornos e visitas pedidas, montada a partir dos leads. */
export default function Agenda() {
  const { leads, setLeads, leadsState, products } = useOutletContext();
  const [openId, setOpenId] = useState(null);
  const [owners, setOwners] = useState([]);
  const navigate = useNavigate();

  // Fim de exclusividade dos imóveis (coleção privada `owners`) 
  useEffect(() => {
    fetchOwners()
      .then(setOwners)
      .catch(() => setOwners([]));
  }, []);

  const groups = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const events = [];
    leads.forEach((l) => {
      if (l.stage === "Fechado") return;
      if (l.followUpAt) events.push({ key: `${l.id}-f`, at: l.followUpAt, kind: "retorno", lead: l });
      if (l.visitAt) events.push({ key: `${l.id}-v`, at: l.visitAt, kind: "visita", lead: l });
    });
    const horizon = new Date(today.getTime() + 45 * DAY);
    owners.forEach((o) => {
      const p = products.find((x) => x.id === o.productId);
      if (!o.exclusiveUntil || !p || o.exclusiveUntil > horizon) return;
      if (o.exclusiveUntil < new Date(today.getTime() - 7 * DAY)) return;
      events.push({ key: `${o.productId}-x`, at: o.exclusiveUntil, kind: "exclusividade", product: p, owner: o });
    });
    events.sort((a, b) => a.at - b.at);

    const late = (e) => (e.kind === "retorno" && e.at < now) || (e.kind === "exclusividade" && startOfDay(e.at) < today);
    const overdue = events.filter(late);
    const upcoming = events.filter((e) => startOfDay(e.at) >= today && !late(e));
    const byDay = new Map();
    upcoming.forEach((e) => {
      const k = startOfDay(e.at).getTime();
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(e);
    });
    return {
      overdue,
      days: [...byDay.entries()].map(([k, list]) => ({ title: dayTitle(new Date(k), today), list })),
    };
  }, [leads, owners, products]);

  if (leadsState.loading) return <div className="admin-loading">Carregando agenda…</div>;

  const openLead = openId ? leads.find((l) => l.id === openId) : null;
  const empty = !groups.overdue.length && !groups.days.length;

  const renderEvent = (e) =>
    e.kind === "exclusividade" ? (
      <button key={e.key} type="button" className="agenda-item agenda-item--exclusividade" onClick={() => navigate(`/admin/editar/${e.product.id}`)}>
        <span className="agenda-time">Exclusiv.</span>
        <span className="agenda-main">
          <strong className="text-ellipsis">{e.product.title}</strong>
          <small className="text-ellipsis">
            Fim da exclusividade{e.owner.name ? ` · ${e.owner.name}` : ""}
          </small>
        </span>
      </button>
    ) : (
      <button key={e.key} type="button" className={`agenda-item agenda-item--${e.kind}`} onClick={() => setOpenId(e.lead.id)}>
        <span className="agenda-time">
          {e.kind === "visita" && e.lead.visitPeriod
            ? visitPeriodLabel(e.lead.visitPeriod)
            : e.at.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="agenda-main">
          <strong className="text-ellipsis">{e.lead.name}</strong>
          <small className="text-ellipsis">
            {e.kind === "visita" ? "Visita pedida" : "Retorno"}
            {e.lead.productTitle ? ` · ${e.lead.productTitle}` : ""}
          </small>
        </span>
        {e.lead.phone && (
          <span className="agenda-phone">
            <Phone size={12} /> {formatPhone(e.lead.phone)}
          </span>
        )}
      </button>
    );

  return (
    <div className="admin-stack">
      {empty ? (
        <section className="admin-card">
          <div className="agenda-empty">
            <CalendarDays size={22} />
            <p className="admin-empty">
              Nada agendado. Os retornos que você marca nos leads e os pedidos de visita feitos pelo site aparecem aqui.
            </p>
          </div>
        </section>
      ) : (
        <>
          {groups.overdue.length > 0 && (
            <section className="admin-card agenda-day agenda-day--late">
              <h2>Atrasados</h2>
              {groups.overdue.map(renderEvent)}
            </section>
          )}
          {groups.days.map((d) => (
            <section key={d.title} className="admin-card agenda-day">
              <h2>{d.title}</h2>
              {d.list.map(renderEvent)}
            </section>
          ))}
        </>
      )}

      {openLead && (
        <LeadDrawer
          key={openLead.id}
          lead={openLead}
          products={products}
          onClose={() => setOpenId(null)}
          onSaved={(saved) => setLeads((list) => list.map((l) => (l.id === saved.id ? saved : l)))}
          onDeleted={(id) => setLeads((list) => list.filter((l) => l.id !== id))}
        />
      )}
    </div>
  );
}
