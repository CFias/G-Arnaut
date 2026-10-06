import { useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PropertiesTable } from "./PropertiesTable";
import { LeadCard } from "./Leads";

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

  return (
    <div className="admin-stack">
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

      <PropertiesTable products={products} compact title="Mais vistos" />
    </div>
  );
}
