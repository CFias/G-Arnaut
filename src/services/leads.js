import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./FirebaseConfig";
import { toDate } from "../lib/format";
import { incrementLeads } from "./products";

const COLLECTION = "leads";

export function normalizeLead(id, d = {}) {
  return {
    id,
    name: (d.name || "").trim() || "Visitante do site",
    phone: d.phone || "",
    productId: d.productId || null,
    productTitle: d.productTitle || "",
    productCode: d.productCode || "",
    source: d.source || "whatsapp",
    stage: d.stage || "Novo",
    message: d.message || "",
    createdAt: toDate(d.createdAt),
  };
}

/**
 * Registra um lead quando alguém clica em "Tenho interesse" ou envia o
 * formulário de contato. Fire-and-forget: nunca bloqueia a abertura do
 * WhatsApp. Exige regra no Firestore permitindo `create` público em
 * `leads` (ver FIRESTORE_RULES.md); sem ela, falha em silêncio.
 */
export async function createLead({ name = "", phone = "", productId = null, productTitle = "", productCode = "", source = "whatsapp", message = "" }) {
  try {
    await addDoc(collection(db, COLLECTION), {
      name: name.slice(0, 120),
      phone: phone.slice(0, 30),
      productId,
      productTitle: productTitle.slice(0, 200),
      productCode: productCode.slice(0, 40),
      source,
      message: message.slice(0, 1000),
      stage: "Novo",
      createdAt: serverTimestamp(),
    });
    if (productId) incrementLeads(productId);
  } catch (error) {
    if (import.meta.env.DEV) console.warn("Lead não registrado:", error?.code || error);
  }
}

export async function fetchLeads() {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => normalizeLead(d.id, d.data()));
}

export async function updateLeadStage(id, stage) {
  await updateDoc(doc(db, COLLECTION, id), { stage });
}
