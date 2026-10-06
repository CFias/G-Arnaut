import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowRight, Pencil, Search, Trash2, Users } from "lucide-react";
import { Dialog } from "@mui/material";
import { useToast } from "../../contexts/ToastContext";
import { deleteProduct, updateProduct } from "../../services/products";
import { LISTING_STATUS, NEGOCIOS, negocioLabel } from "../../lib/constants";
import { brlShort, formatPhone, initials, normalizeText, priceSuffix, waPhone } from "../../lib/format";
import { matchingLeads } from "../../lib/crm";
import { productUrl, waLink } from "../../lib/whatsapp";

/** Leads em aberto que combinam com o imóvel, com atalho para enviar. */
function MatchesDialog({ product, leads, products, onClose }) {
  const list = product ? matchingLeads(product, leads, products) : [];
  return (
    <Dialog open={Boolean(product)} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="match-title">
      {product && (
        <div className="confirm">
          <h2 id="match-title">Quem pode se interessar</h2>
          <p>
            Leads em aberto cuja procura combina com <strong>{product.title}</strong> ({product.code}).
          </p>
          {list.length === 0 ? (
            <p className="admin-empty">Nenhum lead combina com este imóvel por enquanto.</p>
          ) : (
            <ul className="match-list">
              {list.map((l) => {
                const phone = waPhone(l.phone);
                const first = l.hasName ? `, ${l.name.split(" ")[0]}` : "";
                return (
                  <li key={l.id} className="match">
                    <span className="lead-avatar" aria-hidden="true">{initials(l.name)}</span>
                    <div className="match-text">
                      <strong className="text-ellipsis">{l.name}</strong>
                      <small>{l.phone ? formatPhone(l.phone) : "sem telefone"} · {l.stage}</small>
                    </div>
                    {phone ? (
                      <a
                        className="btn btn--outline btn--sm"
                        href={waLink(`Olá${first}! Chegou um imóvel que combina com o que você procura: ${product.title}.\n${productUrl(product.id)}`, phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Enviar
                      </a>
                    ) : (
                      <Link to="/admin/leads" className="row-link">Ver lead</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="confirm-actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>Fechar</button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

const slug = (s) => normalizeText(s).replace(/\s+/g, "-");

/**
 * Tabela de imóveis do painel. `compact` = versão "Mais vistos" da visão
 * geral (sem filtros, 5 linhas, ordenada por visualizações).
 */
export function PropertiesTable({ products, leads = [], compact = false, title }) {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [matchFor, setMatchFor] = useState(null);

  // ?match=<id> (vindo do cadastro) abre a lista de interessados uma vez
  useEffect(() => {
    const id = params.get("match");
    if (!id || compact) return;
    const p = products.find((x) => x.id === id);
    if (p && matchingLeads(p, leads, products).length) setMatchFor(p);
    const next = new URLSearchParams(params);
    next.delete("match");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, products, compact, setParams]);
  const [search, setSearch] = useState("");
  const [negocio, setNegocio] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(() => {
    if (compact) return [...products].sort((a, b) => b.views - a.views).slice(0, 5);
    const q = normalizeText(search.trim());
    return products.filter(
      (p) =>
        (!negocio || p.negocio === negocio) &&
        (!q || normalizeText(`${p.title} ${p.neighborhood} ${p.code}`).includes(q)),
    );
  }, [products, compact, search, negocio]);

  const changeStatus = async (p, status) => {
    setBusyId(p.id);
    try {
      await updateProduct(p.id, { listingStatus: status });
      toast(`${p.code} agora está ${status.toLowerCase()}`);
    } catch (e) {
      console.error(e);
      toast("Não foi possível alterar o status");
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (p) => {
    setBusyId(p.id);
    try {
      await updateProduct(p.id, { isFeatured: !p.isFeatured });
      toast(p.isFeatured ? "Removido dos destaques" : "Adicionado aos destaques da home");
    } catch (e) {
      console.error(e);
      toast("Não foi possível alterar o destaque");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const p = toDelete;
    setToDelete(null);
    setBusyId(p.id);
    try {
      await deleteProduct(p.id);
      toast(`${p.code} excluído`);
    } catch (e) {
      console.error(e);
      toast("Não foi possível excluir o imóvel");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>{title || `${rows.length} ${rows.length === 1 ? "imóvel" : "imóveis"} na carteira`}</h2>
        {!compact && (
          <div className="table-filters">
            <label className="table-search">
              <Search size={15} />
              <span className="visually-hidden">Buscar</span>
              <input
                className="input input--sm input--soft"
                placeholder="Título, bairro ou código"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select className="select input--sm input--soft" aria-label="Filtrar por negócio" value={negocio} onChange={(e) => setNegocio(e.target.value)}>
              <option value="">Todos os negócios</option>
              {NEGOCIOS.map((n) => (
                <option key={n.key} value={n.key}>{n.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">
          {products.length ? "Nenhum imóvel encontrado com esse filtro." : "Nenhum imóvel cadastrado ainda."}
        </p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Imóvel</th>
                <th scope="col">Preço</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">Views</th>
                <th scope="col" className="num">Leads</th>
                <th scope="col">Interessados</th>
                <th scope="col">Destaque</th>
                <th scope="col"><span className="visually-hidden">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} aria-busy={busyId === p.id}>
                  <td>
                    <div className="row-property">
                      <div className="row-thumb img-placeholder">
                        {p.cover && <img src={p.cover} alt="" loading="lazy" />}
                      </div>
                      <div className="row-text">
                        <strong className="text-ellipsis">{p.title}</strong>
                        <small className="text-ellipsis">
                          {p.code} · {negocioLabel(p.negocio)} · {p.neighborhood || p.city}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="nowrap">
                    {p.price ? brlShort(p.price) : "—"}
                    <small className="muted">{p.price ? priceSuffix(p.negocio) : ""}</small>
                  </td>
                  <td>
                    <select
                      className={`status-select pill pill--${slug(p.listingStatus)}`}
                      value={p.listingStatus}
                      onChange={(e) => changeStatus(p, e.target.value)}
                      disabled={busyId === p.id}
                      aria-label={`Status de ${p.code}`}
                    >
                      {LISTING_STATUS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="num">{p.views.toLocaleString("pt-BR")}</td>
                  <td className="num">{p.leadsCount}</td>
                  <td>
                    {(() => {
                      const n = matchingLeads(p, leads, products).length;
                      return (
                        <button
                          type="button"
                          className={`match-count${n ? " has" : ""}`}
                          onClick={() => setMatchFor(p)}
                          title="Leads cuja procura combina com este imóvel"
                        >
                          <Users size={14} /> {n}
                        </button>
                      );
                    })()}
                  </td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      className="switch switch--gold"
                      aria-checked={p.isFeatured}
                      aria-label={`Destacar ${p.code} na home`}
                      onClick={() => toggleFeatured(p)}
                      disabled={busyId === p.id}
                    />
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/product/${p.id}`} className="row-link" target="_blank" rel="noopener noreferrer">
                        Ver <ArrowRight size={14} />
                      </Link>
                      {!compact && (
                        <>
                          <Link to={`/admin/editar/${p.id}`} className="icon-btn icon-btn--sm" aria-label={`Editar ${p.code}`} title="Editar">
                            <Pencil size={15} />
                          </Link>
                          <button
                            type="button"
                            className="icon-btn icon-btn--sm icon-btn--danger"
                            onClick={() => setToDelete(p)}
                            aria-label={`Excluir ${p.code}`}
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MatchesDialog product={matchFor} leads={leads} products={products} onClose={() => setMatchFor(null)} />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} aria-labelledby="del-title" maxWidth="xs" fullWidth>
        <div className="confirm">
          <h2 id="del-title">Excluir este imóvel?</h2>
          <p>
            <strong>{toDelete?.title}</strong> ({toDelete?.code}) sai do site e do painel. Essa ação não pode ser desfeita.
            Se ele só foi vendido ou alugado, prefira mudar o status.
          </p>
          <div className="confirm-actions">
            <button type="button" className="btn btn--outline" onClick={() => setToDelete(null)}>
              Cancelar
            </button>
            <button type="button" className="btn btn--danger" onClick={confirmDelete}>
              <Trash2 size={15} /> Excluir imóvel
            </button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}

export default function PropertiesPage() {
  const { products, loading, leads } = useOutletContext();
  if (loading) return <div className="admin-loading">Carregando imóveis…</div>;
  return <PropertiesTable products={products} leads={leads} />;
}
