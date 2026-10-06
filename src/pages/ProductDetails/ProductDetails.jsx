import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  Expand,
  Heart,
  MapPin,
  Ruler,
  Share2,
} from "lucide-react";
import PublicLayout from "../../components/PublicLayout/PublicLayout";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import Lightbox from "../../components/Lightbox/Lightbox";
import { useProducts } from "../../hooks/useProducts";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { fetchProduct, registerView } from "../../services/products";
import { AGENT, negocioLabel, situacaoLabel } from "../../lib/constants";
import { brl, formatPrice, priceLabel, priceSuffix, youtubeId } from "../../lib/format";
import { productMessage, productUrl, trackWhatsApp, waLink } from "../../lib/whatsapp";
import Profile from "../../assets/image/arnaut-profile.webp";
import "./styles.css";

function Mosaic({ images, title, onOpen }) {
  const n = images.length;
  if (!n) {
    return (
      <div className="mosaic mosaic--1">
        <div className="mosaic-tile img-placeholder mosaic-empty">Fotos em breve</div>
      </div>
    );
  }
  const shown = n >= 5 ? 5 : n >= 3 ? 3 : 1;
  return (
    <div className={`mosaic mosaic--${shown}`}>
      {images.slice(0, shown).map((src, i) => (
        <button key={src + i} type="button" className="mosaic-tile" onClick={() => onOpen(i)} aria-label={`Abrir foto ${i + 1}`}>
          <img src={src} alt={i === 0 ? title : ""} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
        </button>
      ))}
      <button type="button" className="btn btn--white btn--sm mosaic-all" onClick={() => onOpen(0)}>
        <Expand size={15} /> Ver as {n} fotos
      </button>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container detail" aria-busy="true">
      <div className="skeleton" style={{ height: 20, width: 160, marginBottom: 20, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: "clamp(300px, 40vw, 488px)", borderRadius: 16 }} />
      <div className="detail-grid" style={{ marginTop: 32 }}>
        <div>
          <div className="skeleton" style={{ height: 36, width: "70%", borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 16, width: "40%", marginTop: 12, borderRadius: 6 }} />
        </div>
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    </div>
  );
}

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isFavorite, toggle } = useFavorites();
  const { products } = useProducts();
  const [product, setProduct] = useState(undefined); // undefined = carregando, null = não existe
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let alive = true;
    setProduct(undefined);
    fetchProduct(id)
      .then((p) => alive && setProduct(p))
      .catch((e) => {
        console.error("Erro ao buscar imóvel:", e);
        if (alive) setProduct(null);
      });
    registerView(id);
    return () => {
      alive = false;
    };
  }, [id]);

  useDocumentTitle(product?.title || (product === null ? "Imóvel não encontrado" : "Imóvel"));

  const similares = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && (p.negocio === product.negocio || p.neighborhood === product.neighborhood))
      .sort((a, b) => Number(b.neighborhood === product.neighborhood) - Number(a.neighborhood === product.neighborhood))
      .slice(0, 4);
  }, [products, product]);

  if (product === undefined) {
    return (
      <PublicLayout cta={false}>
        <DetailSkeleton />
      </PublicLayout>
    );
  }

  if (product === null) {
    return (
      <PublicLayout>
        <div className="container detail">
          <div className="empty-box">
            <strong>Este imóvel não está mais disponível</strong>
            <p>Ele pode ter sido vendido, alugado ou removido. Veja outras opções ou fale comigo.</p>
            <div className="empty-actions">
              <Link to="/imoveis" className="btn btn--primary">Ver imóveis</Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const p = product;
  const fav = isFavorite(p.id);
  const unavailable = p.listingStatus === "Vendido" || p.listingStatus === "Alugado";
  const video = youtubeId(p.videoLink);
  const fullAddress = [p.address, p.neighborhood, p.city].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    p.lat != null && p.lng != null ? `${p.lat},${p.lng}` : `${fullAddress} ${p.state}`,
  )}`;

  const specs = [
    [Ruler, p.area, "m² de área"],
    [BedDouble, p.bedrooms, p.bedrooms === 1 ? "quarto" : "quartos"],
    [Bath, p.bathrooms, p.bathrooms === 1 ? "banheiro" : "banheiros"],
    [Car, p.parkingSpaces, p.parkingSpaces === 1 ? "vaga" : "vagas"],
    [CalendarDays, p.negocio === "lancamento" ? p.deliveryDate : "", "entrega"],
  ].filter(([, v]) => v);

  const features = [
    ...p.amenities,
    p.furnished ? "Mobiliado" : null,
    p.petFriendly ? "Aceita pet" : null,
  ].filter(Boolean);

  const costs = [
    ["Condomínio", p.condoFee ? brl(p.condoFee) : "—"],
    ["IPTU (mês)", p.iptu ? brl(p.iptu) : "—"],
    ["Situação", situacaoLabel(p.situacao) || "—"],
  ];

  const share = async () => {
    const url = productUrl(p.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: p.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link do imóvel copiado");
    } catch (e) {
      if (e?.name !== "AbortError") toast("Não foi possível copiar o link");
    }
  };

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/imoveis"));

  return (
    <PublicLayout>
      <article className="container detail">
        <div className="detail-top">
          <button type="button" className="link-back" onClick={goBack}>
            <ArrowLeft size={16} /> Voltar aos imóveis
          </button>
          <div className="detail-top-actions">
            <button type="button" className="btn btn--outline btn--sm" onClick={share}>
              <Share2 size={15} /> Compartilhar
            </button>
            <button type="button" className={`btn btn--outline btn--sm${fav ? " is-fav" : ""}`} onClick={() => toggle(p.id)} aria-pressed={fav}>
              <Heart size={15} fill={fav ? "currentColor" : "none"} /> {fav ? "Salvo" : "Salvar"}
            </button>
          </div>
        </div>

        <Mosaic images={p.images} title={p.title} onOpen={setLightbox} />

        <div className="detail-grid">
          <div className="detail-main">
            <header className="detail-header">
              <span className="detail-kicker">
                <span className="badge badge--primary">{negocioLabel(p.negocio)}</span>
                {p.category} · {p.neighborhood || p.city} · {p.code}
              </span>
              <h1 className="page-title">{p.title}</h1>
              {fullAddress && (
                <span className="detail-address">
                  <MapPin size={15} /> {fullAddress}
                </span>
              )}
              {unavailable && <span className="pill pill--primary detail-status">Este imóvel foi {p.listingStatus.toLowerCase()}</span>}
              {p.listingStatus === "Reservado" && <span className="pill pill--reservado detail-status">Reservado</span>}
            </header>

            {specs.length > 0 && (
              <div className="detail-specs">
                {specs.map(([Icon, v, label]) => (
                  <div key={label} className="spec-card">
                    <Icon size={18} className="spec-icon" />
                    <strong>{typeof v === "number" ? v.toLocaleString("pt-BR") : v}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {p.description && (
              <section className="detail-section">
                <h2>Sobre o imóvel</h2>
                <p className="detail-desc">{p.description}</p>
              </section>
            )}

            {features.length > 0 && (
              <section className="detail-section">
                <h2>O que tem</h2>
                <ul className="feature-list">
                  {features.map((f) => (
                    <li key={f}>
                      <Check size={14} /> {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {video && (
              <section className="detail-section">
                <h2>Vídeo do imóvel</h2>
                <div className="detail-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video}`}
                    title={`Vídeo — ${p.title}`}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            <section className="detail-section">
              <h2>Onde fica</h2>
              <a className="detail-map" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <span className="detail-map-pin"><MapPin size={20} /></span>
                <span>
                  <strong>{[p.neighborhood, p.city].filter(Boolean).join(", ")}</strong>
                  <small>Abrir no Google Maps <ArrowUpRight size={13} /></small>
                </span>
              </a>
            </section>
          </div>

          <aside className="detail-aside">
            <div className="price-card">
              <span className="price-label">{priceLabel(p.negocio)}</span>
              <span className="price-value">
                {p.price ? brl(p.price) : formatPrice(p)}
                {p.price > 0 && <small>{priceSuffix(p.negocio)}</small>}
              </span>

              <dl className="price-costs">
                {costs.map(([l, v]) => (
                  <div key={l}>
                    <dt>{l}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <a
                className="btn btn--primary btn--lg btn--block price-cta"
                href={waLink(productMessage(p))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsApp({ product: p })}
              >
                Tenho interesse — WhatsApp <ArrowUpRight size={16} />
              </a>

              <div className="price-agent">
                <img src={Profile} alt="" width={44} height={44} loading="lazy" />
                <span>
                  <strong>{AGENT.name}</strong>
                  <small>{AGENT.role} · {AGENT.creci}</small>
                </span>
              </div>
            </div>
          </aside>
        </div>

        {similares.length > 0 && (
          <section className="detail-similar">
            <h2>Você também vai gostar</h2>
            <div className="property-grid">
              {similares.map((s) => <PropertyCard key={s.id} product={s} />)}
            </div>
          </section>
        )}
      </article>

      <div className="detail-mobile-bar">
        <span>
          <small>{priceLabel(p.negocio)}</small>
          <strong>
            {p.price ? brl(p.price) : formatPrice(p)}
            {p.price > 0 && <em>{priceSuffix(p.negocio)}</em>}
          </strong>
        </span>
        <a
          className="btn btn--primary"
          href={waLink(productMessage(p))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsApp({ product: p })}
        >
          Tenho interesse
        </a>
      </div>

      {lightbox !== null && p.images.length > 0 && (
        <Lightbox
          images={p.images}
          index={lightbox}
          title={p.title}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </PublicLayout>
  );
};

export default ProductDetails;
