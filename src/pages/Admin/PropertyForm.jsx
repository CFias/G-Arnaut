import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ImagePlus, Lock, MapPin, Star, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { createProduct, fetchProduct, toFirestore, updateProduct } from "../../services/products";
import { MAX_IMAGES, uploadMany } from "../../services/images";
import { EMPTY_OWNER, fetchOwner, hasOwnerData, saveOwner } from "../../services/owners";
import { LISTING_STATUS, NEGOCIOS, SITUACOES, TIPOS, negocioGroup } from "../../lib/constants";
import { formatPhone, maskMoney } from "../../lib/format";

const EMPTY = {
  title: "",
  negocio: "venda",
  category: "Apartamento",
  situacao: "Obra finalizada",
  price: "",
  condoFee: "",
  iptu: "",
  refProduct: "",
  deliveryDate: "",
  address: "",
  neighborhood: "",
  city: "Salvador",
  state: "BA",
  lat: "",
  lng: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  description: "",
  videoLink: "",
  amenities: "",
  isFeatured: false,
  furnished: false,
  petFriendly: false,
  listingStatus: "Ativo",
};

const MONEY = ["price", "condoFee", "iptu"];
const INTEGER = ["area", "bedrooms", "bathrooms", "parkingSpaces"];

function formFromProduct(p) {
  const money = (n) => (n ? maskMoney(String(Math.round(n))) : "");
  const int = (n) => (n ? String(n) : "");
  return {
    ...EMPTY,
    title: p.raw.title || p.title,
    negocio: p.negocio,
    category: p.category === "Imóvel" ? EMPTY.category : p.category,
    situacao: p.situacao || EMPTY.situacao,
    price: money(p.price),
    condoFee: money(p.condoFee),
    iptu: money(p.iptu),
    refProduct: p.refProduct,
    deliveryDate: p.deliveryDate,
    address: p.address,
    neighborhood: p.neighborhood,
    city: p.city,
    state: p.state,
    lat: p.lat ?? "",
    lng: p.lng ?? "",
    area: int(p.area),
    bedrooms: int(p.bedrooms),
    bathrooms: int(p.bathrooms),
    parkingSpaces: int(p.parkingSpaces),
    description: p.description,
    videoLink: p.videoLink,
    amenities: p.amenities.join(", "),
    isFeatured: p.isFeatured,
    furnished: p.furnished,
    petFriendly: p.petFriendly,
    listingStatus: p.listingStatus,
  };
}

function Field({ label, name, form, onChange, error, full, hint, as = "input", options, ...rest }) {
  const id = `f-${name}`;
  return (
    <div className={`field${full ? " field--full" : ""}`}>
      <label htmlFor={id} className="field-label">{label}</label>
      {as === "select" ? (
        <select id={id} name={name} className="select input--soft" value={form[name]} onChange={onChange}>
          {options.map((o) => {
            const [value, text] = Array.isArray(o) ? o : [o, o];
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
      ) : as === "textarea" ? (
        <textarea id={id} name={name} className="textarea input--soft" value={form[name]} onChange={onChange} rows={5} {...rest} />
      ) : (
        <input
          id={id}
          name={name}
          className="input input--soft"
          value={form[name]}
          onChange={onChange}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...rest}
        />
      )}
      {hint && <span id={`${id}-hint`} className="field-hint">{hint}</span>}
    </div>
  );
}

function Section({ n, title, desc, children }) {
  return (
    <section className="form-section">
      <div className="form-section-head">
        <span className="form-step">{n}</span>
        <div>
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
      </div>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export default function PropertyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { userName, photoURL } = useAuth();
  const { reload } = useOutletContext();

  const [form, setForm] = useState(EMPTY);
  const [owner, setOwner] = useState(EMPTY_OWNER);
  const [ownerLoaded, setOwnerLoaded] = useState(false);
  const [geo, setGeo] = useState({ loading: false, msg: "" });
  const [photos, setPhotos] = useState([]); // { key, url } | { key, file, preview }
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [saving, setSaving] = useState(null); // null | "Rascunho" | "Ativo" | "edit"
  const [progress, setProgress] = useState(0);
  const fileInput = useRef(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    fetchProduct(id)
      .then((p) => {
        if (!alive) return;
        if (!p) return setNotFound(true);
        setForm(formFromProduct(p));
        setPhotos(p.images.map((url) => ({ key: url, url })));
        fetchOwner(id)
          .then((o) => {
            if (!alive || !o) return;
            const pad = (n) => String(n).padStart(2, "0");
            const ex = o.exclusiveUntil;
            setOwner({
              name: o.name,
              phone: formatPhone(o.phone),
              email: o.email,
              exclusiveUntil: ex ? `${ex.getFullYear()}-${pad(ex.getMonth() + 1)}-${pad(ex.getDate())}` : "",
              commission: o.commission == null ? "" : String(o.commission),
              notes: o.notes,
            });
            setOwnerLoaded(true);
          })
          .catch(() => { });
      })
      .catch(() => alive && setNotFound(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  // Libera as prévias locais ao sair da página
  useEffect(
    () => () => photosRef.current.forEach((ph) => ph.preview && URL.revokeObjectURL(ph.preview)),
    [],
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (MONEY.includes(name)) v = maskMoney(value);
    if (INTEGER.includes(name)) v = value.replace(/\D/g, "").slice(0, 6);
    setForm((f) => ({ ...f, [name]: v }));
    setError("");
  };

  const setOwnerField = (e) => {
    const { name, value } = e.target;
    setOwner((o) => ({ ...o, [name]: name === "phone" ? formatPhone(value) : value }));
  };

  /** Busca latitude/longitude pelo endereço no OpenStreetMap (gratuito). */
  const geocode = async () => {
    const q = [form.address, form.neighborhood, form.city, form.state, "Brasil"].filter(Boolean).join(", ");
    if (!form.neighborhood && !form.address) {
      setGeo({ loading: false, msg: "Preencha endereço ou bairro primeiro." });
      return;
    }
    setGeo({ loading: true, msg: "" });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`,
        { headers: { "Accept-Language": "pt-BR" } },
      );
      const [hit] = await res.json();
      if (!hit) {
        setGeo({ loading: false, msg: "Endereço não encontrado. Tente só rua e bairro, ou preencha à mão." });
        return;
      }
      setForm((f) => ({ ...f, lat: Number(hit.lat).toFixed(6), lng: Number(hit.lon).toFixed(6) }));
      setGeo({ loading: false, msg: "Coordenadas preenchidas. Confira no mapa da página do imóvel." });
    } catch {
      setGeo({ loading: false, msg: "Não foi possível buscar agora. Preencha à mão se precisar." });
    }
  };

  const toggle = (name) => setForm((f) => ({ ...f, [name]: !f[name] }));

  const addFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const room = MAX_IMAGES - photos.length;
    if (room <= 0) {
      setPhotoError(`Limite de ${MAX_IMAGES} fotos atingido. Remova alguma para adicionar outra.`);
      return;
    }
    const accepted = files.filter((f) => f.type.startsWith("image/")).slice(0, room);
    setPhotoError(files.length > room ? `Só cabiam mais ${room} — as demais não foram adicionadas.` : "");
    setPhotos((list) => [
      ...list,
      ...accepted.map((file) => ({ key: `${file.name}-${file.size}-${Math.random()}`, file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removePhoto = (i) => {
    setPhotos((list) => {
      const removed = list[i];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return list.filter((_, j) => j !== i);
    });
    setPhotoError("");
  };

  const makeCover = (i) => setPhotos((list) => [list[i], ...list.filter((_, j) => j !== i)]);

  const submit = async (status) => {
    if (!form.title.trim() || !form.price) {
      setError("Preencha ao menos o título e o preço.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(status);
    setProgress(0);
    try {
      const files = photos.filter((p) => p.file).map((p) => p.file);
      const uploaded = await uploadMany(files, setProgress);
      let k = 0;
      const images = photos.map((p) => (p.file ? uploaded[k++] : p.url));
      const data = toFirestore({ ...form, images, listingStatus: status === "edit" ? form.listingStatus : status });

      // Proprietário fica em coleção privada; se falhar, o imóvel já foi salvo
      const persistOwner = async (productId) => {
        if (!hasOwnerData(owner) && !ownerLoaded) return;
        try {
          await saveOwner(productId, owner);
        } catch (err) {
          console.error("Erro ao salvar proprietário:", err);
          toast("Imóvel salvo, mas os dados do proprietário não — confira as regras do Firestore");
        }
      };

      if (isEdit) {
        await updateProduct(id, data);
        await persistOwner(id);
        toast("Alterações salvas");
        navigate("/admin/imoveis");
      } else {
        const newId = await createProduct(data, { userName, photoURL });
        await persistOwner(newId);
        await reload();
        toast(status === "Rascunho" ? "Rascunho salvo" : "Imóvel publicado no site");
        // Publicado: já mostra quem pode se interessar por ele
        navigate(status === "Rascunho" ? "/admin/imoveis" : `/admin/imoveis?match=${newId}`);
      }
    } catch (e) {
      console.error("Erro ao salvar imóvel:", e);
      setError("Não foi possível salvar. Verifique a conexão e tente de novo.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="admin-loading">Carregando imóvel…</div>;
  if (notFound) return <section className="admin-card"><p className="admin-empty">Imóvel não encontrado.</p></section>;

  const group = negocioGroup(form.negocio);
  const priceLabel = group === "dia" ? "Diária (R$)" : group === "mes" ? "Aluguel mensal (R$)" : "Preço (R$)";
  const busy = saving !== null;
  const fieldProps = { form, onChange };

  return (
    <form className="property-form" onSubmit={(e) => { e.preventDefault(); submit(isEdit ? "edit" : "Ativo"); }} noValidate>
      {error && <div className="form-error" role="alert">{error}</div>}

      <Section n="01" title="Informações" desc="O título aparece no card e no topo da página.">
        <Field {...fieldProps} full name="title" label="Título do anúncio" placeholder="Ex: Apartamento com vista mar na Barra" error={error && !form.title.trim()} maxLength={120} />
        <Field {...fieldProps} as="select" name="negocio" label="Negócio" options={NEGOCIOS.map((n) => [n.key, n.label])} />
        <Field {...fieldProps} as="select" name="category" label="Tipo" options={TIPOS} />
        <Field {...fieldProps} as="select" name="situacao" label="Situação" options={SITUACOES.map((s) => [s.value, s.label])} />
        <Field {...fieldProps} name="price" label={priceLabel} placeholder="0" inputMode="numeric" error={error && !form.price} />
        <Field {...fieldProps} name="condoFee" label="Condomínio (R$)" placeholder="0" inputMode="numeric" />
        <Field {...fieldProps} name="iptu" label="IPTU mensal (R$)" placeholder="0" inputMode="numeric" />
        <Field {...fieldProps} name="refProduct" label="Referência / código" placeholder="Ex: GA-0012" hint="Vai na mensagem do WhatsApp. Se ficar vazio, o site gera um." />
        {form.negocio === "lancamento" && (
          <Field {...fieldProps} name="deliveryDate" label="Previsão de entrega" placeholder="Ex: Dez/27" />
        )}
      </Section>

      <Section n="02" title="Localização" desc="O bairro alimenta os filtros e a busca da home.">
        <Field {...fieldProps} full name="address" label="Endereço" placeholder="Rua, número" />
        <Field {...fieldProps} name="neighborhood" label="Bairro" placeholder="Ex: Pituba" />
        <Field {...fieldProps} name="city" label="Cidade" placeholder="Salvador" />
        <Field {...fieldProps} name="state" label="Estado" placeholder="BA" maxLength={2} />
        <Field {...fieldProps} name="lat" label="Latitude" placeholder="-12.9714" inputMode="decimal" hint="Opcional — posiciona o imóvel no mapa." />
        <Field {...fieldProps} name="lng" label="Longitude" placeholder="-38.5014" inputMode="decimal" />
        <div className="field geo-field">
          <span className="field-label" aria-hidden="true">&nbsp;</span>
          <button type="button" className="btn btn--outline" onClick={geocode} disabled={geo.loading}>
            <MapPin size={15} /> {geo.loading ? "Buscando…" : "Buscar pelo endereço"}
          </button>
          {geo.msg && <span className="field-hint">{geo.msg}</span>}
        </div>
      </Section>

      <Section n="03" title="Características" desc="Esses números aparecem no card e nos filtros.">
        <Field {...fieldProps} name="area" label="Área (m²)" placeholder="0" inputMode="numeric" />
        <Field {...fieldProps} name="bedrooms" label="Quartos" placeholder="0" inputMode="numeric" />
        <Field {...fieldProps} name="bathrooms" label="Banheiros" placeholder="0" inputMode="numeric" />
        <Field {...fieldProps} name="parkingSpaces" label="Vagas" placeholder="0" inputMode="numeric" />
        <Field {...fieldProps} full as="textarea" name="description" label="Descrição" placeholder="O que torna este imóvel único?" />
        <Field {...fieldProps} full name="amenities" label="O que tem" placeholder="Piscina, Varanda gourmet, Portaria 24h" hint="Separe por vírgula. Vira a lista de características na página do imóvel." />
        <Field {...fieldProps} full name="videoLink" label="Link do vídeo (YouTube)" placeholder="https://" type="url" />
      </Section>

      <section className="form-section">
        <div className="form-section-head">
          <span className="form-step">04</span>
          <div>
            <h2>Fotos</h2>
            <p>Até {MAX_IMAGES} imagens. A primeira é a capa do anúncio.</p>
          </div>
        </div>

        <div className="photo-grid">
          {photos.map((ph, i) => (
            <div key={ph.key} className={`photo${i === 0 ? " is-cover" : ""}`}>
              <img src={ph.url || ph.preview} alt={`Foto ${i + 1}`} />
              <span className="photo-tag">{i === 0 ? "Capa" : i + 1}</span>
              <div className="photo-actions">
                {i > 0 && (
                  <button type="button" onClick={() => makeCover(i)} aria-label={`Usar foto ${i + 1} como capa`} title="Usar como capa">
                    <Star size={14} />
                  </button>
                )}
                <button type="button" onClick={() => removePhoto(i)} aria-label={`Remover foto ${i + 1}`} title="Remover">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {photos.length < MAX_IMAGES && (
            <button type="button" className="photo-add" onClick={() => fileInput.current?.click()}>
              <ImagePlus size={22} />
              <span>Adicionar fotos</span>
              <small>{photos.length} de {MAX_IMAGES}</small>
            </button>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={addFiles} />
        {photoError && <p className="field-hint photo-error">{photoError}</p>}
      </section>

      <section className="form-section">
        <div className="form-section-head">
          <span className="form-step">05</span>
          <div>
            <h2>Publicação</h2>
            <p>Como o imóvel aparece no site.</p>
          </div>
        </div>
        <div className="toggle-list">
          {[
            ["isFeatured", "Destacar na home", "Aparece primeiro nas categorias da página inicial", true],
            ["furnished", "Mobiliado", "Aparece no filtro de mobiliados"],
            ["petFriendly", "Aceita pet", "Aparece no filtro de pet"],
          ].map(([name, label, desc, gold]) => (
            <div key={name} className="toggle-row">
              <span>
                <strong id={`tg-${name}`}>{label}</strong>
                <small>{desc}</small>
              </span>
              <button
                type="button"
                role="switch"
                className={`switch${gold ? " switch--gold" : ""}`}
                aria-checked={form[name]}
                aria-labelledby={`tg-${name}`}
                onClick={() => toggle(name)}
              />
            </div>
          ))}
          {isEdit && (
            <div className="toggle-row">
              <label htmlFor="f-listingStatus">
                <strong>Status do anúncio</strong>
                <small>Rascunho não aparece no site; Vendido e Alugado saem das buscas.</small>
              </label>
              <select id="f-listingStatus" name="listingStatus" className="select input--sm input--soft status-field" value={form.listingStatus} onChange={onChange}>
                {LISTING_STATUS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-head">
          <span className="form-step">06</span>
          <div>
            <h2>Proprietário <span className="private-tag"><Lock size={12} /> só no painel</span></h2>
            <p>Não aparece no site. Fica guardado separado dos dados públicos do imóvel.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">Nome</span>
            <input className="input input--soft" name="name" value={owner.name} onChange={setOwnerField} autoComplete="off" />
          </label>
          <label className="field">
            <span className="field-label">Telefone</span>
            <input className="input input--soft" name="phone" value={owner.phone} onChange={setOwnerField} inputMode="tel" placeholder="(71) 99999-9999" autoComplete="off" />
          </label>
          <label className="field">
            <span className="field-label">E-mail</span>
            <input className="input input--soft" name="email" type="email" value={owner.email} onChange={setOwnerField} autoComplete="off" />
          </label>
          <label className="field">
            <span className="field-label">Exclusividade até</span>
            <input className="input input--soft" name="exclusiveUntil" type="date" value={owner.exclusiveUntil} onChange={setOwnerField} />
          </label>
          <label className="field">
            <span className="field-label">Comissão (%)</span>
            <input className="input input--soft" name="commission" inputMode="decimal" value={owner.commission} onChange={setOwnerField} placeholder="Ex: 6" />
          </label>
          <label className="field field--full">
            <span className="field-label">Observações</span>
            <textarea className="textarea input--soft" name="notes" rows={3} value={owner.notes} onChange={setOwnerField} placeholder="Chaves, horários de visita, condições de negociação…" />
          </label>
        </div>
      </section>

      <div className="form-actions">
        {busy && photos.some((p) => p.file) && (
          <span className="form-progress" aria-live="polite">Enviando fotos… {progress}%</span>
        )}
        {isEdit ? (
          <>
            <button type="button" className="btn btn--outline" onClick={() => navigate("/admin/imoveis")} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? "Salvando…" : "Salvar alterações"}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--outline" onClick={() => submit("Rascunho")} disabled={busy}>
              {saving === "Rascunho" ? "Salvando…" : "Salvar rascunho"}
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {saving === "Ativo" ? "Publicando…" : "Publicar no site"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
