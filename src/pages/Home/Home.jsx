import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Search } from "lucide-react";
import PublicLayout from "../../components/PublicLayout/PublicLayout";
import { PropertyCard, PropertyCardSkeleton } from "../../components/PropertyCard/PropertyCard";
import { useProducts } from "../../hooks/useProducts";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { AGENT, BAIRRO_VIBE, NEGOCIOS, TIPOS } from "../../lib/constants";
import { listingUrl } from "../../lib/filters";
import { trackWhatsApp, waLink } from "../../lib/whatsapp";
import HeroImage from "../../assets/image/g-arnaut-banner.webp";
import Profile from "../../assets/image/arnaut-profile.webp";
import "./styles.css";

const SEARCH_TABS = [
  ["filtros", "Buscar imóveis"],
  ["palavra", "Por palavra-chave"],
  ["avancado", "Filtros avançados"],
];

const RESIDENCIAL = ["Apartamento", "Casa", "Cobertura"];
const TERRENOS = ["Terreno", "Sítio", "Fazenda"];

const CATEGORIES = [
  {
    label: "Residencial",
    match: (p) => RESIDENCIAL.includes(p.category) && (p.negocio === "venda" || p.negocio === "aluguel"),
    url: listingUrl(),
  },
  { label: "Lançamentos", match: (p) => p.negocio === "lancamento", url: listingUrl({ negocio: "lancamento" }) },
  { label: "Comercial", match: (p) => p.negocio === "comercial", url: listingUrl({ negocio: "comercial" }) },
  { label: "Temporada", match: (p) => p.negocio === "temporada", url: listingUrl({ negocio: "temporada" }) },
  { label: "Terrenos", match: (p) => TERRENOS.includes(p.category), url: listingUrl({ tipo: "Terreno" }) },
];

function HeroSearch({ bairros }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("filtros");
  const [negocio, setNegocio] = useState("");
  const [tipo, setTipo] = useState("");
  const [bairro, setBairro] = useState("");
  const [kw, setKw] = useState("");

  const selectTab = (key) => {
    if (key === "avancado") navigate(listingUrl({ negocio, tipo, bairro }, { filtros: "1" }));
    else setTab(key);
  };

  const submit = (e) => {
    e.preventDefault();
    navigate(tab === "palavra" ? listingUrl({ kw: kw.trim() }) : listingUrl({ negocio, tipo, bairro }));
  };

  return (
    <div className="hero-search">
      <div className="hero-search-tabs" role="tablist" aria-label="Tipo de busca">
        {SEARCH_TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`hero-search-tab${tab === key ? " is-on" : ""}`}
            onClick={() => selectTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="hero-search-row" onSubmit={submit} role="search">
        {tab === "filtros" ? (
          <>
            <label className="visually-hidden" htmlFor="hs-negocio">Finalidade</label>
            <select id="hs-negocio" className="select" value={negocio} onChange={(e) => setNegocio(e.target.value)}>
              <option value="">Finalidade</option>
              {NEGOCIOS.map((n) => (
                <option key={n.key} value={n.key}>{n.label}</option>
              ))}
            </select>
            <label className="visually-hidden" htmlFor="hs-tipo">Tipo de imóvel</label>
            <select id="hs-tipo" className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Tipo de imóvel</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label className="visually-hidden" htmlFor="hs-bairro">Bairro</label>
            <select id="hs-bairro" className="select" value={bairro} onChange={(e) => setBairro(e.target.value)}>
              <option value="">Bairro</option>
              {bairros.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="visually-hidden" htmlFor="hs-kw">Palavra-chave</label>
            <input
              id="hs-kw"
              className="input hero-search-kw"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="Ex: vista mar, piscina, Rio Vermelho ou código GA-0002"
              autoComplete="off"
            />
          </>
        )}
        <button type="submit" className="btn btn--primary btn--lg hero-search-btn">
          <Search size={17} /> Buscar
        </button>
      </form>
    </div>
  );
}

export const Home = () => {
  useDocumentTitle("Imóveis em Salvador");
  const { products, loading } = useProducts();
  const [category, setCategory] = useState(CATEGORIES[0].label);

  const bairros = useMemo(() => {
    const counts = new Map();
    products.forEach((p) => p.neighborhood && counts.set(p.neighborhood, (counts.get(p.neighborhood) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const activeCat = CATEGORIES.find((c) => c.label === category) || CATEGORIES[0];
  const catList = useMemo(
    () =>
      products
        .filter(activeCat.match)
        .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.views - a.views)
        .slice(0, 8),
    [products, activeCat],
  );

  return (
    <PublicLayout>
      {/* ---------- Hero ---------- */}
      <section className="hero-wrap">
        <div className="hero" style={{ backgroundImage: `url(${HeroImage})` }}>
          <div className="hero-content">
            <span className="hero-kicker">
              {AGENT.role} · {AGENT.creci}
            </span>
            <h1>
              Encontre o seu <span>lugar</span> em Salvador com {AGENT.name}
            </h1>
            <p>{AGENT.bio}</p>
          </div>
        </div>
        <div className="container hero-search-wrap">
          <HeroSearch bairros={bairros.map(([b]) => b).sort((a, b) => a.localeCompare(b, "pt-BR"))} />
        </div>
      </section>

      {/* ---------- Categorias ---------- */}
      <section className="section container home-cats" aria-labelledby="cats-title">
        <h2 id="cats-title" className="section-title">Busque seu imóvel por categoria</h2>
        <div className="cat-tabs" role="tablist" aria-label="Categorias">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              type="button"
              role="tab"
              aria-selected={category === c.label}
              className={`cat-tab${category === c.label ? " is-on" : ""}`}
              onClick={() => setCategory(c.label)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="property-grid">
            {Array.from({ length: 4 }, (_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : catList.length ? (
          <div className="property-grid">
            {catList.map((p, i) => <PropertyCard key={p.id} product={p} priority={i < 3} />)}
          </div>
        ) : (
          <div className="empty-box">
            <strong>Nenhum imóvel nesta categoria agora</strong>
            <a
              href={waLink(`Olá, ${AGENT.firstName}! Procuro um imóvel na categoria ${category}. Pode me avisar quando surgir?`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp()}
            >
              Me avise quando surgir um →
            </a>
          </div>
        )}

        <div className="home-cats-more">
          <Link to={activeCat.url} className="btn btn--outline">
            Ver todos — {category} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ---------- Bairros ---------- */}
      {bairros.length > 0 && (
        <section className="section container home-bairros" aria-labelledby="bairros-title">
          <div className="home-bairros-head">
            <h2 id="bairros-title" className="section-title">Explore por bairro</h2>
            <span className="muted">Salvador e região metropolitana</span>
          </div>
          <div className="bairro-grid">
            {bairros.slice(0, 8).map(([nome, n]) => (
              <Link key={nome} to={listingUrl({ bairro: nome })} className="bairro-card">
                <span className="bairro-text">
                  <strong>{nome}</strong>
                  <small>{BAIRRO_VIBE[nome] || "Ver imóveis no bairro"}</small>
                </span>
                <span className="bairro-count" aria-label={`${n} imóveis`}>{n}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Sobre ---------- */}
      <section className="section container" aria-labelledby="sobre-title">
        <div className="home-about">
          <div className="home-about-photo">
            <img src={Profile} alt={AGENT.name} loading="lazy" width={640} height={512} />
          </div>
          <div className="home-about-text">
            <span className="eyebrow">{AGENT.role}</span>
            <h2 id="sobre-title">{AGENT.name}</h2>
            <span className="creci">{AGENT.creci}</span>
            <p>{AGENT.bio}</p>
            <div className="home-about-actions">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn--primary" onClick={() => trackWhatsApp()}>
                <MessageCircle size={16} /> Conversar no WhatsApp
              </a>
              <Link to="/about" className="btn btn--outline">Saiba mais</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
