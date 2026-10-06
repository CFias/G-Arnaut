import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./FirebaseConfig";
import { phoneDigits, toDate } from "../lib/format";
import { incrementLeads } from "./products";

const COLLECTION = "leads";

function normalizeNote(n = {}) {
  return {
    id: n.id || String(toDate(n.at)?.getTime() || Math.random()),
    text: n.text || "",
    kind: n.kind || "note", // note | stage | system
    at: toDate(n.at),
  };
}

function normalizeWants(w) {
  if (!w || typeof w !== "object") return null;
  return {
    negocio: w.negocio || "",
    tipo: w.tipo || "",
    bairro: w.bairro || "",
    priceMax: Number(w.priceMax) || 0,
    quartos: Number(w.quartos) || 0,
  };
}

export function normalizeLead(id, d = {}) {
  const notes = Array.isArray(d.notes) ? d.notes.map(normalizeNote) : [];
  notes.sort((a, b) => (b.at?.getTime() || 0) - (a.at?.getTime() || 0));
  return {
    id,
    raw: d,
    name: (d.name || "").trim() || "Visitante do site",
    hasName: Boolean((d.name || "").trim()),
    phone: phoneDigits(d.phone),
    email: (d.email || "").trim(),
    productId: d.productId || null,
    productTitle: d.productTitle || "",
    productCode: d.productCode || "",
    source: d.source || "whatsapp",
    stage: d.stage || "Novo",
    message: d.message || "",
    followUpAt: toDate(d.followUpAt),
    visitAt: toDate(d.visitAt),
    visitPeriod: d.visitPeriod || "",
    wants: normalizeWants(d.wants),
    notes,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

const newNote = (text, kind = "note") => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  text: text.trim().slice(0, 2000),
  kind,
  at: new Date(),
  by: auth.currentUser?.uid || "",
});

/**
 * Registra um lead quando alguém clica em "Tenho interesse" ou envia o
 * formulário de contato. Fire-and-forget: nunca bloqueia a abertura do
 * WhatsApp. Exige regra no Firestore permitindo `create` público em
 * `leads` (ver FIRESTORE_RULES.md); sem ela, falha em silêncio.
 */
export async function createLead({
  name = "",
  phone = "",
  productId = null,
  productTitle = "",
  productCode = "",
  source = "whatsapp",
  message = "",
  wants = null,
  visitAt = null,
  visitPeriod = "",
}) {
  try {
    await addDoc(collection(db, COLLECTION), {
      name: name.trim().slice(0, 120),
      phone: phoneDigits(phone),
      productId,
      productTitle: productTitle.slice(0, 200),
      productCode: productCode.slice(0, 40),
      source,
      message: message.slice(0, 1000),
      stage: "Novo",
      ...(wants ? { wants: normalizeWants(wants) } : {}),
      ...(visitAt ? { visitAt, visitPeriod } : {}),
      createdAt: serverTimestamp(),
    });
    if (productId) incrementLeads(productId);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.warn("Lead não registrado:", error?.code || error);
    return false;
  }
}

export async function fetchLeads() {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => normalizeLead(d.id, d.data()));
}

/** Campos editáveis no painel → documento. */
function leadFields(form, product) {
  return {
    name: form.name.trim().slice(0, 120),
    phone: phoneDigits(form.phone),
    email: form.email.trim().slice(0, 160),
    source: form.source,
    stage: form.stage,
    productId: product?.id || null,
    productTitle: product?.title || "",
    productCode: product?.code || "",
    followUpAt: form.followUpAt || null,
    wants: form.wants ? normalizeWants(form.wants) : null,
  };
}

/** Lead cadastrado à mão no painel (indicação, ligação, portal...). */
export async function createManualLead(form, product) {
  const data = leadFields(form, product);
  const notes = form.firstNote?.trim() ? [newNote(form.firstNote)] : [];
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    message: "",
    notes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (product?.id) incrementLeads(product.id);
  return normalizeLead(ref.id, { ...data, notes, createdAt: new Date(), updatedAt: new Date() });
}

/**
 * Salva a edição. Se a etapa mudou, registra isso no histórico.
 * Devolve o lead atualizado para o estado local.
 */
export async function saveLead(lead, form, product) {
  const data = leadFields(form, product);
  const extra = [];
  if (data.stage !== lead.stage) extra.push(newNote(`Etapa: ${lead.stage} → ${data.stage}`, "stage"));
  const prevFollow = lead.followUpAt?.getTime() || null;
  const nextFollow = data.followUpAt?.getTime() || null;
  if (prevFollow !== nextFollow) {
    extra.push(
      newNote(
        data.followUpAt
          ? `Retorno agendado para ${data.followUpAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`
          : "Retorno removido",
        "system",
      ),
    );
  }
  await updateDoc(doc(db, COLLECTION, lead.id), {
    ...data,
    ...(extra.length ? { notes: arrayUnion(...extra) } : {}),
    updatedAt: serverTimestamp(),
  });
  return normalizeLead(lead.id, {
    ...lead.raw,
    ...data,
    notes: [...(lead.raw.notes || []), ...extra],
    updatedAt: new Date(),
  });
}

export async function updateLeadStage(lead, stage) {
  const note = newNote(`Etapa: ${lead.stage} → ${stage}`, "stage");
  await updateDoc(doc(db, COLLECTION, lead.id), {
    stage,
    notes: arrayUnion(note),
    updatedAt: serverTimestamp(),
  });
  return normalizeLead(lead.id, { ...lead.raw, stage, notes: [...(lead.raw.notes || []), note] });
}

export async function addLeadNote(lead, text) {
  const note = newNote(text);
  await updateDoc(doc(db, COLLECTION, lead.id), { notes: arrayUnion(note), updatedAt: serverTimestamp() });
  return normalizeLead(lead.id, { ...lead.raw, notes: [...(lead.raw.notes || []), note] });
}

/** Marca o retorno como feito: limpa a data e registra no histórico. */
export async function completeFollowUp(lead) {
  const note = newNote("Retorno feito", "system");
  await updateDoc(doc(db, COLLECTION, lead.id), {
    followUpAt: null,
    notes: arrayUnion(note),
    updatedAt: serverTimestamp(),
  });
  return normalizeLead(lead.id, { ...lead.raw, followUpAt: null, notes: [...(lead.raw.notes || []), note] });
}

export async function deleteLead(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
