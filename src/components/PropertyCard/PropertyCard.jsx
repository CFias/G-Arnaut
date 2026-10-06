import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavorites } from "../../contexts/FavoritesContext";
import { formatPrice, priceSuffix } from "../../lib/format";
import { negocioLabel } from "../../lib/constants";
import "./styles.css";

export function cardBadge(p) {
  if (p.negocio === "lancamento") return { label: "Lançamento", tone: "primary" };
  if (p.listingStatus === "Reservado") return { label: "Reservado", tone: "neutral" };
  if (p.isFeatured) return { label: "Destaque", tone: "gold" };
  return { label: negocioLabel(p.negocio), tone: "primary" };
}

export function cardSpecs(p) {
  if (p.category === "Terreno") return p.area ? [[p.area, "m²"]] : [];
  return [
    [p.area, "m²"],
    [p.bedrooms, "qts"],
    [p.bathrooms, "ban"],
    [p.parkingSpaces, "vg"],
  ].filter(([n]) => n);
}

/** Card de imóvel (README → "Card de imóvel" / CardClean.dc.html). */
function PropertyCardBase({ product: p, priority = false }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(p.id);
  const badge = cardBadge(p);
  const specs = cardSpecs(p);

  return (
    <article className="pcard">
      <div className="pcard-media">
        {p.cover ? (
          <img
            src={p.cover}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={600}
            height={400}
          />
        ) : (
          <div className="pcard-noimg img-placeholder">
            <span>Fotos em breve</span>
          </div>
        )}
        <span className={`badge badge--${badge.tone} pcard-badge`}>{badge.label}</span>
        <button
          type="button"
          className={`pcard-fav${fav ? " is-on" : ""}`}
          aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
          aria-pressed={fav}
          onClick={() => toggle(p.id)}
        >
          <Heart size={16} fill={fav ? "currentColor" : "none"} strokeWidth={2} />
        </button>
      </div>

      <div className="pcard-body">
        <span className="pcard-local text-ellipsis">
          {[p.neighborhood, p.city].filter(Boolean).join(" · ")}
        </span>
        <div className="pcard-row">
          <h3 className="pcard-title text-ellipsis">
            {/* O link cobre o card inteiro (::after), mantendo o botão de favorito clicável */}
            <Link to={`/product/${p.id}`} className="pcard-link">
              {p.title}
            </Link>
          </h3>
          <span className="pcard-price">
            {formatPrice(p)}
            {p.price > 0 && <small>{priceSuffix(p.negocio)}</small>}
          </span>
        </div>
      </div>

      <div className="pcard-specs">
        {specs.length ? (
          specs.map(([n, l]) => (
            <span key={l}>
              <b>{n.toLocaleString("pt-BR")}</b> {l}
            </span>
          ))
        ) : (
          <span>{p.category}</span>
        )}
      </div>
    </article>
  );
}

export const PropertyCard = memo(PropertyCardBase);
export default PropertyCard;

export function PropertyCardSkeleton() {
  return (
    <div className="pcard pcard--skeleton" aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: "3 / 2", borderRadius: 0 }} />
      <div className="pcard-body">
        <div className="skeleton" style={{ height: 12, width: "45%", borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 16, width: "85%", borderRadius: 6, marginTop: 6 }} />
      </div>
      <div className="pcard-specs">
        <div className="skeleton" style={{ height: 12, width: "70%", borderRadius: 6 }} />
      </div>
    </div>
  );
}
