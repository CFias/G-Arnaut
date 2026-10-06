import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, LayoutDashboard, Menu, MessageCircle, X } from "lucide-react";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { isAdminUser } from "../../config/adminUsers";
import { useProducts } from "../../hooks/useProducts";
import { listingUrl } from "../../lib/filters";
import { trackWhatsApp, waLink } from "../../lib/whatsapp";
import { logout } from "../../services/FirebaseConfig";
import "./styles.css";

const MENUS = [
  {
    key: "vendas",
    label: "Vendas",
    items: [
      ["Apartamentos", { negocio: "venda", tipo: "Apartamento" }],
      ["Casas", { negocio: "venda", tipo: "Casa" }],
      ["Coberturas", { negocio: "venda", tipo: "Cobertura" }],
      ["Lançamentos", { negocio: "lancamento" }],
      ["Todos à venda", { negocio: "venda" }],
    ],
  },
  {
    key: "locacoes",
    label: "Locações",
    items: [
      ["Aluguel residencial", { negocio: "aluguel" }],
      ["Temporada", { negocio: "temporada" }],
      ["Comercial", { negocio: "comercial" }],
    ],
  },
];

const MOBILE_LINKS = [
  ["Início", "/"],
  ["Comprar", listingUrl({ negocio: "venda" })],
  ["Alugar", listingUrl({ negocio: "aluguel" })],
  ["Lançamentos", listingUrl({ negocio: "lancamento" })],
  ["Temporada", listingUrl({ negocio: "temporada" })],
  ["Comercial", listingUrl({ negocio: "comercial" })],
  ["Sobre", "/about"],
  ["Contato", "/contato"],
];

function Dropdown({ menu, counts, open, onOpen, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const onClick = (e) => !ref.current?.contains(e.target) && onClose();
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  return (
    <div className="nav-dd" ref={ref} onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        className={`nav-link${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? onClose() : onOpen())}
      >
        {menu.label}
        <ChevronDown size={14} className="nav-caret" />
      </button>
      {open && (
        <div className="nav-dd-panel" role="menu">
          {menu.items.map(([label, filters], i) => (
            <Link key={label} role="menuitem" to={listingUrl(filters)} className="nav-dd-item" onClick={onClose}>
              <span>{label}</span>
              <span className="nav-dd-count">{counts[i]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const Navbar = () => {
  const { currentUser } = useAuth() || {};
  const { count } = useFavorites();
  const { products } = useProducts();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = isAdminUser(currentUser);

  // Fecha tudo ao trocar de página
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        MENUS.map((m) => [
          m.key,
          m.items.map(
            ([, f]) =>
              products.filter((p) => (!f.negocio || p.negocio === f.negocio) && (!f.tipo || p.category === f.tipo)).length,
          ),
        ]),
      ),
    [products],
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? " is-active" : ""}`;

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="brand" aria-label="Gildavi Arnaut Imóveis — página inicial">
          <img src={Logo} alt="" width={44} height={44} />
          <span className="brand-text">
            <strong>Gildavi Arnaut</strong>
            <small>Imóveis</small>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Principal">
          <NavLink to="/" end className={linkClass}>
            Início
          </NavLink>
          {MENUS.map((m) => (
            <Dropdown
              key={m.key}
              menu={m}
              counts={counts[m.key]}
              open={openMenu === m.key}
              onOpen={() => setOpenMenu(m.key)}
              onClose={() => setOpenMenu((cur) => (cur === m.key ? null : cur))}
            />
          ))}
          <NavLink to="/about" className={linkClass}>
            Sobre
          </NavLink>
          <NavLink to="/contato" className={linkClass}>
            Contato
          </NavLink>
        </nav>

        <div className="nav-actions">
          {isAdmin && (
            <Link to="/admin" className="btn btn--ghost btn--sm nav-admin" title="Painel do corretor">
              <LayoutDashboard size={16} />
              <span>Painel</span>
            </Link>
          )}
          <Link to="/imoveis?favoritos=1" className="btn btn--outline btn--sm nav-favs" aria-label={`Favoritos (${count})`}>
            <Heart size={15} />
            <span>{count}</span>
          </Link>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--sm nav-cta"
            onClick={() => trackWhatsApp()}
          >
            <MessageCircle size={16} />
            <span>Fale comigo</span>
          </a>
          <button
            type="button"
            className="icon-btn nav-burger"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-menu" className="nav-mobile" aria-label="Menu">
          <div className="container">
            {MOBILE_LINKS.map(([label, to]) => (
              <Link key={label} to={to} className="nav-mobile-link">
                {label}
              </Link>
            ))}
            <Link to="/imoveis?favoritos=1" className="nav-mobile-link">
              Favoritos <span className="nav-dd-count">{count}</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="nav-mobile-link">
                Painel do corretor
              </Link>
            )}
            {currentUser && (
              <button type="button" className="nav-mobile-link" onClick={handleLogout}>
                Sair
              </button>
            )}
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--block nav-mobile-cta"
              onClick={() => trackWhatsApp()}
            >
              <MessageCircle size={16} /> Fale comigo no WhatsApp
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
