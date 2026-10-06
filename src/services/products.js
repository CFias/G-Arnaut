import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./FirebaseConfig";
import { parseNumberBR, toDate } from "../lib/format";
import { NEGOCIO_BY_KEY, PUBLIC_STATUS, bairroComPrep } from "../lib/constants";

const COLLECTION = "products";

const toBool = (v) => v === true || v === "sim" || v === "true" || v === 1;

/**
 * Converte um documento do Firestore (antigo ou novo) no formato que as
 * telas usam. Nada aqui grava no banco: documentos antigos continuam
 * como estão e ganham defaults só na leitura.
 */
export function normalizeProduct(id, data = {}) {
  const rawType = String(data.productType || "venda").toLowerCase();
  let negocio = NEGOCIO_BY_KEY[rawType] ? rawType : "venda";
  // Lançamentos antigos eram "venda" + status "Lançamento"
  if (negocio === "venda" && data.status === "Lançamento") negocio = "lancamento";

  const category = data.category || "Imóvel";
  const neighborhood = (data.neighborhood || "").trim();
  const city = (data.city || "Salvador").trim();
  const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  const lat = data.lat === "" || data.lat == null ? null : Number(data.lat);
  const lng = data.lng === "" || data.lng == null ? null : Number(data.lng);

  return {
    id,
    raw: data,
    title:
      (data.title || "").trim() ||
      [category, bairroComPrep(neighborhood)].filter(Boolean).join(" "),
    code: (data.refProduct || "").trim() || `GA-${id.slice(0, 4).toUpperCase()}`,
    refProduct: data.refProduct || "",
    negocio,
    productType: rawType,
    category,
    situacao: data.status || "",
    listingStatus: data.listingStatus || "Ativo",
    price: parseNumberBR(data.price),
    condoFee: parseNumberBR(data.condoFee),
    iptu: parseNumberBR(data.iptu),
    area: parseNumberBR(data.dimension),
    bedrooms: parseNumberBR(data.bedrooms),
    bathrooms: parseNumberBR(data.bathrooms),
    parkingSpaces: parseNumberBR(data.parkingSpaces),
    furnished: toBool(data.furnished),
    petFriendly: toBool(data.petFriendly),
    isFeatured: toBool(data.isFeatured),
    address: (data.address || "").trim(),
    neighborhood,
    city,
    state: (data.state || "BA").trim(),
    description: data.description || "",
    videoLink: data.videoLink || "",
    deliveryDate: data.deliveryDate || "",
    amenities: Array.isArray(data.amenities) ? data.amenities.filter(Boolean) : [],
    images,
    cover: images[0] || null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    views: Number(data.views) || 0,
    leadsCount: Number(data.leadsCount) || 0,
    author: data.author || null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export const isPublic = (p) => PUBLIC_STATUS.includes(p.listingStatus);

// ---------------------------------------------------------------------------
// Cache em memória: o catálogo é pequeno, então baixamos a coleção uma vez
// por sessão e todas as telas (home, listagem, contagens do menu, detalhe,
// painel) leem da mesma lista. Qualquer escrita invalida o cache.
// ---------------------------------------------------------------------------
let cache = null;
let pending = null;
const listeners = new Set();

export const subscribeProducts = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const emit = () => listeners.forEach((fn) => fn(cache));

export function getCachedProducts() {
  return cache;
}

export async function fetchProducts({ force = false } = {}) {
  if (cache && !force) return cache;
  if (pending && !force) return pending;
  pending = getDocs(collection(db, COLLECTION))
    .then((snap) => {
      cache = snap.docs
        .map((d) => normalizeProduct(d.id, d.data()))
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      emit();
      return cache;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

export async function fetchProduct(id) {
  const fromCache = cache?.find((p) => p.id === id);
  if (fromCache) return fromCache;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? normalizeProduct(snap.id, snap.data()) : null;
}

function patchCache(id, patch) {
  if (!cache) return;
  cache = cache.map((p) =>
    p.id === id ? normalizeProduct(id, { ...p.raw, ...patch }) : p,
  );
  emit();
}

const toCoord = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** Monta o documento a partir do formulário do painel. */
export function toFirestore(form) {
  const num = (v) => parseNumberBR(v);
  return {
    title: form.title.trim(),
    productType: form.negocio,
    category: form.category,
    status: form.situacao,
    listingStatus: form.listingStatus || "Ativo",
    price: num(form.price),
    condoFee: num(form.condoFee),
    iptu: num(form.iptu),
    refProduct: form.refProduct.trim(),
    address: form.address.trim(),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    dimension: num(form.area),
    bedrooms: num(form.bedrooms),
    bathrooms: num(form.bathrooms),
    parkingSpaces: num(form.parkingSpaces),
    description: form.description.trim(),
    videoLink: form.videoLink.trim(),
    deliveryDate: form.negocio === "lancamento" ? form.deliveryDate.trim() : "",
    lat: toCoord(form.lat),
    lng: toCoord(form.lng),
    amenities: form.amenities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    isFeatured: Boolean(form.isFeatured),
    furnished: Boolean(form.furnished),
    petFriendly: Boolean(form.petFriendly),
    images: form.images,
  };
}

export async function createProduct(data, authorInfo) {
  const user = auth.currentUser;
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    views: 0,
    leadsCount: 0,
    author: {
      uid: user?.uid || "",
      userName: authorInfo?.userName || user?.displayName || "",
      photoURL: authorInfo?.photoURL || user?.photoURL || "",
    },
    createdAt: serverTimestamp(),
  });
  cache = null;
  return ref.id;
}

export async function updateProduct(id, patch) {
  await updateDoc(doc(db, COLLECTION, id), { ...patch, updatedAt: serverTimestamp() });
  patchCache(id, { ...patch, updatedAt: new Date() });
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, COLLECTION, id));
  if (cache) {
    cache = cache.filter((p) => p.id !== id);
    emit();
  }
}

/**
 * Conta uma visualização por imóvel por sessão. Se as regras do Firestore
 * não permitirem a escrita para visitantes anônimos, falha em silêncio.
 */
export async function registerView(id) {
  const key = `ga:viewed:${id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    await updateDoc(doc(db, COLLECTION, id), { views: increment(1) });
  } catch {
    /* sem permissão ou sem sessionStorage — ignorar */
  }
}

export async function incrementLeads(id) {
  try {
    await updateDoc(doc(db, COLLECTION, id), { leadsCount: increment(1) });
  } catch {
    /* idem */
  }
}
