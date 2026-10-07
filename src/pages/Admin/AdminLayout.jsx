import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  PlusCircle,
  UserRound,
  Users,
} from "lucide-react";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { useProducts } from "../../hooks/useProducts";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { fetchLeads } from "../../services/leads";
import { logout } from "../../services/FirebaseConfig";
import { AGENT } from "../../lib/constants";
import "./styles.css";

const TITLES = {
  "/admin": "Visão geral",
  "/admin/imoveis": "Imóveis",
  "/admin/cadastrar": "Novo imóvel",
  "/admin/leads": "Leads",
  "/admin/agenda": "Agenda",
};

function greeting(name) {
  const h = new Date().getHours();
  const hello = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  return `${hello}, ${name}`;
}

export default function AdminLayout() {
  const { userName } = useAuth();
  const { products, loading, reload } = useProducts({ onlyPublic: false });
  const [leads, setLeads] = useState([]);
  const [leadsState, setLeadsState] = useState({ loading: true, error: null });
  const location = useLocation();
  const navigate = useNavigate();

  const loadLeads = useCallback(async () => {
    setLeadsState({ loading: true, error: null });
    try {
      setLeads(await fetchLeads());
      setLeadsState({ loading: false, error: null });
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
      setLeadsState({ loading: false, error });
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const [moreOpen, setMoreOpen] = useState(false);

  // Fecha o menu "Mais" ao trocar de página
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const title = location.pathname.startsWith("/admin/editar")
    ? "Editar imóvel"
    : TITLES[location.pathname.replace(/\/$/, "")] || "Painel";
  useDocumentTitle(`${title} · Painel`);

  const newLeads = leads.filter((l) => l.stage === "Novo").length;
  // Retornos vencidos/hoje + visitas pedidas para hoje
  const agendaCount = leads.filter((l) => {
    if (l.stage === "Fechado") return false;
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return (l.followUpAt && l.followUpAt <= end) || (l.visitAt && l.visitAt <= end && l.visitAt >= new Date(new Date().setHours(0, 0, 0, 0)));
  }).length;
  const firstName = (userName || AGENT.firstName).split(" ")[0];

  const nav = useMemo(
    () => [
      { to: "/admin", end: true, label: "Visão geral", short: "Início", icon: LayoutDashboard },
      { to: "/admin/imoveis", label: "Imóveis", icon: Building2, badge: products.length || "" },
      { to: "/admin/cadastrar", label: "Cadastrar imóvel", icon: PlusCircle },
      { to: "/admin/leads", label: "Leads", icon: Users, badge: newLeads || "" },
      { to: "/admin/agenda", label: "Agenda", icon: CalendarDays, badge: agendaCount || "" },
    ],
    [products.length, newLeads, agendaCount],
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const showNewButton = !["/admin/cadastrar", "/admin/leads", "/admin/agenda"].includes(location.pathname) && !location.pathname.startsWith("/admin/editar");

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/" className="admin-brand" title="Ver o site">
          <img src={Logo} alt="" width={36} height={36} />
          <span>
            <strong>Gildavi Arnaut</strong>
            <small>Painel</small>
          </span>
        </Link>

        <nav className="admin-nav" aria-label="Painel">
          {nav.map(({ to, end, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-item${isActive ? " is-active" : ""}`}>
              <Icon size={17} />
              <span>{label}</span>
              {badge ? <span className="admin-badge">{badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-foot">
          <Link to="/add-posts" className="admin-nav-item admin-nav-item--muted">
            <FileText size={16} /> <span>Publicar post</span>
          </Link>
          <Link to="/edit-profile" className="admin-nav-item admin-nav-item--muted">
            <UserRound size={16} /> <span>Editar perfil</span>
          </Link>
          <Link to="/" className="admin-nav-item admin-nav-item--muted">
            <ExternalLink size={16} /> <span>Ver site</span>
          </Link>
          <button type="button" className="admin-nav-item admin-nav-item--muted" onClick={handleLogout}>
            <LogOut size={16} /> <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Celular e tablet: barra superior + navegação inferior */}
      <header className="admin-topbar">
        <Link to="/admin" className="admin-brand">
          <img src={Logo} alt="" width={32} height={32} />
          <span>
            <strong>Gildavi Arnaut</strong>
            <small>Painel</small>
          </span>
        </Link>
        <Link to="/" className="btn btn--ghost btn--sm" title="Ver o site">
          <ExternalLink size={15} /> Site
        </Link>
      </header>

      <nav className="admin-tabbar" aria-label="Painel">
        {nav
          .filter((n) => n.to !== "/admin/cadastrar")
          .map(({ to, end, short, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab-item${isActive ? " is-active" : ""}`}>
              <span className="tab-icon">
                <Icon size={20} />
                {badge ? <span className="tab-badge">{badge}</span> : null}
              </span>
              <span>{short || label}</span>
            </NavLink>
          ))}
        <button
          type="button"
          className={`tab-item${moreOpen ? " is-active" : ""}`}
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          aria-controls="admin-more"
        >
          <span className="tab-icon"><Menu size={20} /></span>
          <span>Mais</span>
        </button>
      </nav>

      {moreOpen && (
        <>
          <div className="more-backdrop" onClick={() => setMoreOpen(false)} aria-hidden="true" />
          <div id="admin-more" className="more-sheet" role="menu">
            <Link to="/admin/cadastrar" className="more-item" role="menuitem">
              <PlusCircle size={18} /> Cadastrar imóvel
            </Link>
            <Link to="/add-posts" className="more-item" role="menuitem">
              <FileText size={18} /> Publicar post
            </Link>
            <Link to="/edit-profile" className="more-item" role="menuitem">
              <UserRound size={18} /> Editar perfil
            </Link>
            <Link to="/" className="more-item" role="menuitem">
              <ExternalLink size={18} /> Ver site
            </Link>
            <button type="button" className="more-item more-item--danger" role="menuitem" onClick={handleLogout}>
              <LogOut size={18} /> Sair
            </button>
          </div>
        </>
      )}

      <div className="admin-main">
        <header className="admin-head">
          <div>
            <span className="admin-greeting">{greeting(firstName)}</span>
            <h1>{title}</h1>
          </div>
          {showNewButton && (
            <Link to="/admin/cadastrar" className="btn btn--primary">
              <Plus size={16} /> <span className="hide-xs">Cadastrar imóvel</span><span className="show-xs">Novo</span>
            </Link>
          )}
        </header>

        <Suspense fallback={<div className="admin-loading">Carregando…</div>}>
          <Outlet
            context={{
              products,
              loading,
              reload,
              leads,
              setLeads,
              leadsState,
              reloadLeads: loadLeads,
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
