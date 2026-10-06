import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./FirebaseConfig";
import { phoneDigits, toDate } from "../lib/format";

/**
 * Proprietário de cada imóvel, em coleção separada (`owners/{productId}`)
 * porque `products` é pública e estes dados não podem vazar.
 * As regras devem liberar leitura e escrita só para admins.
 */
const COLLECTION = "owners";

export const EMPTY_OWNER = { name: "", phone: "", email: "", exclusiveUntil: "", commission: "", notes: "" };

export function normalizeOwner(id, d = {}) {
  return {
    productId: id,
    name: d.name || "",
    phone: phoneDigits(d.phone),
    email: d.email || "",
    exclusiveUntil: toDate(d.exclusiveUntil),
    commission: d.commission ?? "",
    notes: d.notes || "",
  };
}

export const hasOwnerData = (o) => Boolean(o && (o.name || o.phone || o.email || o.exclusiveUntil || o.commission || o.notes));

export async function fetchOwner(productId) {
  const snap = await getDoc(doc(db, COLLECTION, productId));
  return snap.exists() ? normalizeOwner(productId, snap.data()) : null;
}

export async function fetchOwners() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => normalizeOwner(d.id, d.data()));
}

/** form.exclusiveUntil vem como "yyyy-mm-dd" do input de data. */
export async function saveOwner(productId, form) {
  const [y, m, d] = (form.exclusiveUntil || "").split("-").map(Number);
  await setDoc(doc(db, COLLECTION, productId), {
    name: form.name.trim().slice(0, 120),
    phone: phoneDigits(form.phone),
    email: form.email.trim().slice(0, 160),
    exclusiveUntil: form.exclusiveUntil ? new Date(y, m - 1, d, 12) : null,
    commission: form.commission === "" ? null : Number(String(form.commission).replace(",", ".")) || null,
    notes: form.notes.trim().slice(0, 2000),
    updatedAt: serverTimestamp(),
  });
}
