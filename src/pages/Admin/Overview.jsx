import { useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PropertiesTable } from "./PropertiesTable";
import { LeadCard, isDue } from "./Leads";
import { followUpLabel } from "../../lib/format";
import { leadSourceLabel } from "../../lib/constants";

const ADVANCED = { "Em contato": 1, "Visita marcada": 2, Fechado: 3 };

function formatDuration(ms) {
  const h = ms / 3600000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} dias`;
}

/** Funil, origem dos leads e tempo até o primeiro registro de atendimento. */
function funnelStats(leads) {
  const total = leads.length;
  const reached = (min) => leads.filter((l) => (ADVANCED[l.stage] || 0) >= min).length;
  const steps = [
    { label: "Leads", n: total },
    { label: "Em contato", n: reached(1) },
    { label: "Visita", n: reached(2) },
    { label: "Fechado", n: reached(3) },
  ].map((s) => ({ ...s, pct: total ? Math.round((s.n / total) * 100) : 0 }));

  const bySource = new Map();
  leads.forEach((l) => {
    const cur = bySource.get(l.source) || { n: 0, closed: 0 };
    cur.n += 1;
    if (l.stage === "Fechado") cur.closed += 1;
    bySource.set(l.source, cur);
  });
  const sources = [...bySource.entries()]
    .map(([source, v]) => ({ label: leadSourceLabel(source), ...v }))
    .sort((a, b) => b.n - a.n);

  const firstTouch = leads
    .map((l) => {
      const first = [...l.notes].filter((n) => n.at).sort((a, b) => a.at - b.at)[0];
      return first && l.createdAt ? first.at - l.createdAt : null;
    })
    .filter((x) => x != null && x >= 0);
  const avgFirstTouch = firstTouch.length ? firstTouch.reduce((a, b) => a + b, 0) / firstTouch.length : null;

  return { steps, sources, avgFirstTouch, maxSource: Math.max(1, ...sources.map((s) => s.n)) };
}

const WEEKS = 8;
const DAY = 86400000;

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // segunda-feira
  return x;
}

function pctChange(now, before) {
  if (!before) return now ? "novo este mês" : "sem leads ainda";
  const pct = Math.round(((now - before) / before) * 100);
  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const label = prevMonth.toLocaleDateString("pt-BR", { month: "long" });
  return `${pct >= 0 ? "+" : ""}${pct}% vs. ${label}`;
}

export default function Overview() {
  const { products, loading, leads, leadsState } = useOutletContext();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const leadsMonth = leads.filter((l) => l.createdAt && l.createdAt >= monthStart).length;
    const leadsPrev = leads.filter((l) => l.createdAt && l.createdAt >= prevStart && l.createdAt < monthStart).length;

    const thisWeek = startOfWeek(now);
    const weeks = Array.from({ length: WEEKS }, (_, i) => {
      const start = new Date(thisWeek.getTime() - (WEEKS - 1 - i) * 7 * DAY);
      const end = new Date(start.getTime() + 7 * DAY);
      return {
        label: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        n: leads.filter((l) => l.source === "whatsapp" && l.createdAt && l.createdAt >= start && l.createdAt < end).length,
      };
    });
    const max = Math.max(1, ...weeks.map((w) => w.n));

    return {
      kpis: [
        {
          label: "Imóveis ativos",
          value: products.filter((p) => p.listingStatus === "Ativo").length,
          note: `${products.filter((p) => p.isFeatured).length} em destaque`,
        },
        { label: "Leads no mês", value: leadsMonth, note: pctChange(leadsMonth, leadsPrev) },
        {
          label: "Visitas marcadas",
          value: leads.filter((l) => l.stage === "Visita marcada").length,
          note: "em andamento",
        },
        {
          label: "Visualizações",
          value: products.reduce((a, p) => a + p.views, 0).toLocaleString("pt-BR"),
          note: "total acumulado",
        },
      ],
      weeks,
      max,
    };
  }, [products, leads]);

  if (loading) return <div className="admin-loading">Carregando painel…</div>;

  const due = leads.filter(isDue).sort((a, b) => a.followUpAt - b.followUpAt);
  const funnel = funnelStats(leads);

  return (
    <div className="admin-stack">
      {due.length > 0 && (
        <Link to="/admin/leads?filtro=retornos" className="due-banner">
          <span className="due-dot" aria-hidden="true" />
          <span>
            <strong>
              {due.length === 1 ? "1 retorno pendente" : `${due.length} retornos pendentes`}
            </strong>
            <small>
              {due[0].name} · {followUpLabel(due[0].followUpAt)}
              {due.length > 1 ? ` e mais ${due.length - 1}` : ""}
            </small>
          </span>
          <ArrowRight size={16} />
        </Link>
      )}
      <div className="kpi-grid">
        {stats.kpis.map((k) => (
          <div key={k.label} className="kpi">
            <span className="kpi-label">{k.label}</span>
            <strong className="kpi-value">{k.value}</strong>
            <span className="pill pill--gold kpi-note">{k.note}</span>
          </div>
        ))}
      </div>

      <div className="overview-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Contatos via WhatsApp</h2>
            <span className="muted small">últimas {WEEKS} semanas</span>
          </div>
          <div className="chart" role="img" aria-label={`Contatos por semana: ${stats.weeks.map((w) => `${w.label}: ${w.n}`).join(", ")}`}>
            {stats.weeks.map((w, i) => (
              <div key={w.label} className="chart-col">
                <span className="chart-n">{w.n}</span>
                <div className="chart-track">
                  <div
                    className={`chart-bar${i === stats.weeks.length - 1 ? " is-current" : ""}`}
                    style={{ height: `${Math.max(4, (w.n / stats.max) * 100)}%` }}
                  />
                </div>
                <span className="chart-l">{w.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Leads recentes</h2>
            <Link to="/admin/leads" className="row-link">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {leadsState.error ? (
            <p className="admin-empty">Não foi possível ler a coleção de leads. Confira as regras do Firestore.</p>
          ) : leads.length === 0 ? (
            <p className="admin-empty">
              {leadsState.loading ? "Carregando…" : "Os contatos feitos pelo site aparecem aqui."}
            </p>
          ) : (
            <div className="lead-list">
              {leads.slice(0, 5).map((l) => (
                <LeadCard key={l.id} lead={l} compact />
              ))}
            </div>
          )}
        </section>
      </div>

      {leads.length > 0 && (
        <div className="overview-grid">
          <section className="admin-card">
            <div className="admin-card-head">
              <h2>Funil de atendimento</h2>
              {funnel.avgFirstTouch != null && (
                <span className="muted small">1º registro em média: {formatDuration(funnel.avgFirstTouch)}</span>
              )}
            </div>
            <div className="funnel-bars">
              {funnel.steps.map((s, i) => (
                <div key={s.label} className="funnel-row">
                  <span className="funnel-label">{s.label}</span>
                  <div className="funnel-track">
                    <div className={`funnel-fill${i === funnel.steps.length - 1 ? " is-gold" : ""}`} style={{ width: `${Math.max(2, s.pct)}%` }} />
                  </div>
                  <span className="funnel-value">{s.n} <small>{s.pct}%</small></span>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-card-head">
              <h2>De onde vêm os leads</h2>
            </div>
            <div className="funnel-bars">
              {funnel.sources.map((s) => (
                <div key={s.label} className="funnel-row">
                  <span className="funnel-label">{s.label}</span>
                  <div className="funnel-track">
                    <div className="funnel-fill" style={{ width: `${(s.n / funnel.maxSource) * 100}%` }} />
                  </div>
                  <span className="funnel-value">{s.n} <small>{s.closed ? `${s.closed} fech.` : ""}</small></span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <PropertiesTable products={products} leads={leads} compact title="Mais vistos" />
    </div>
  );
}
