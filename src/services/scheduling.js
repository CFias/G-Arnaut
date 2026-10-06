import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "./FirebaseConfig";
import { toDate } from "../lib/format";

/**
 * Agendamento de visitas.
 *
 * - `settings/agenda`: disponibilidade definida no painel (leitura pública,
 *   escrita só admin). Sem esse documento, o agendamento fica desligado.
 * - `bookings/{AAAA-MM-DDTHH:mm}`: um documento por horário reservado. O id
 *   é o próprio horário, então dois visitantes não conseguem reservar o
 *   mesmo slot (a regra só permite `create`, nunca sobrescrever).
 *   Guarda só a data — nenhum dado pessoal fica público.
 */

export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const DEFAULT_SCHEDULE = {
  enabled: false,
  slotMinutes: 60,
  minNoticeHours: 12,
  maxDaysAhead: 21,
  week: {
    0: [],
    1: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
    2: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
    3: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
    4: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
    5: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
    6: [{ start: "09:00", end: "12:00" }],
  },
  blockedDates: [],
};

const pad = (n) => String(n).padStart(2, "0");
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const slotKey = (d) => `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

function normalizeSchedule(d = {}) {
  const week = {};
  for (let i = 0; i < 7; i += 1) {
    const list = d.week?.[i] ?? d.week?.[String(i)];
    week[i] = Array.isArray(list)
      ? list.filter((r) => r && r.start && r.end && toMinutes(r.end) > toMinutes(r.start))
      : [];
  }
  return {
    enabled: Boolean(d.enabled),
    slotMinutes: [30, 45, 60, 90, 120].includes(Number(d.slotMinutes)) ? Number(d.slotMinutes) : 60,
    minNoticeHours: Math.max(0, Number(d.minNoticeHours) || 0),
    maxDaysAhead: Math.min(90, Math.max(1, Number(d.maxDaysAhead) || 21)),
    week,
    blockedDates: Array.isArray(d.blockedDates) ? d.blockedDates.filter(Boolean).sort() : [],
  };
}

let cached = null;

export async function fetchSchedule({ force = false } = {}) {
  if (cached && !force) return cached;
  const snap = await getDoc(doc(db, "settings", "agenda"));
  cached = snap.exists() ? normalizeSchedule(snap.data()) : { ...DEFAULT_SCHEDULE, enabled: false, _missing: true };
  return cached;
}

export async function saveSchedule(s) {
  const data = normalizeSchedule(s);
  await setDoc(doc(db, "settings", "agenda"), { ...data, updatedAt: serverTimestamp() });
  cached = data;
  return data;
}

/** Horários já reservados a partir de agora: Set de slotKey. */
export async function fetchBookings() {
  const snap = await getDocs(query(collection(db, "bookings"), where("at", ">=", new Date())));
  return new Set(snap.docs.map((d) => d.id));
}

/** Todos os horários reservados (painel), com a data. */
export async function fetchAllBookings() {
  const snap = await getDocs(collection(db, "bookings"));
  return snap.docs.map((d) => ({ id: d.id, at: toDate(d.data().at) }));
}

/**
 * Reserva o horário. Lança `SLOT_TAKEN` se outro visitante já pegou
 * (a regra recusa sobrescrever um documento existente).
 */
export async function bookSlot(date) {
  try {
    await setDoc(doc(db, "bookings", slotKey(date)), { at: date, createdAt: serverTimestamp() });
  } catch (e) {
    const err = new Error("SLOT_TAKEN");
    err.cause = e;
    throw err;
  }
}

export async function cancelBooking(date) {
  await deleteDoc(doc(db, "bookings", slotKey(date)));
}

/**
 * Dias e horários livres, de acordo com a disponibilidade semanal,
 * antecedência mínima, horizonte, datas bloqueadas e reservas.
 * → [{ date: Date (00:00), key, slots: Date[] }]
 */
export function availableDays(schedule, booked = new Set(), now = new Date()) {
  if (!schedule?.enabled) return [];
  const earliest = new Date(now.getTime() + schedule.minNoticeHours * 3600000);
  const blocked = new Set(schedule.blockedDates);
  const days = [];
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = 0; i <= schedule.maxDaysAhead; i += 1) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = dayKey(day);
    if (blocked.has(key)) continue;
    const slots = [];
    (schedule.week[day.getDay()] || []).forEach((range) => {
      for (let m = toMinutes(range.start); m + schedule.slotMinutes <= toMinutes(range.end); m += schedule.slotMinutes) {
        const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m / 60), m % 60);
        if (at >= earliest && !booked.has(slotKey(at))) slots.push(at);
      }
    });
    slots.sort((a, b) => a - b);
    if (slots.length) days.push({ date: day, key, slots });
  }
  return days;
}
