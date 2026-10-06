import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
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

  // No celular a sidebar vira uma barra rolável: mantém o item ativo visível
  useEffect(() => {
    document
      .querySelector(".admin-nav-item.is-active")
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [location.pathname]);

  const title = location.pathname.startsWith("/admin/editar")
    ? "Editar imóvel"
    : TITLES[location.pathname.replace(/\/$/, "")] || "Painel";
  useDocumentTitle(`${title} · Painel`);

  const newLeads = leads.filter((l) => l.stage === "Novo").length;
  const firstName = (userName || AGENT.firstName).split(" ")[0];

  const nav = useMemo(
    () => [
      { to: "/admin", end: true, label: "Visão geral", icon: LayoutDashboard },
      { to: "/admin/imoveis", label: "Imóveis", icon: Building2, badge: products.length || "" },
      { to: "/admin/cadastrar", label: "Cadastrar imóvel", icon: PlusCircle },
      { to: "/admin/leads", label: "Leads", icon: Users, badge: newLeads || "" },
    ],
    [products.length, newLeads],
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const showNewButton = !["/admin/cadastrar"].includes(location.pathname) && !location.pathname.startsWith("/admin/editar");

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

      <div className="admin-main">
        <header className="admin-head">
          <div>
            <span className="admin-greeting">{greeting(firstName)}</span>
            <h1>{title}</h1>
          </div>
          {showNewButton && (
            <Link to="/admin/cadastrar" className="btn btn--primary">
              <Plus size={16} /> Cadastrar imóvel
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
