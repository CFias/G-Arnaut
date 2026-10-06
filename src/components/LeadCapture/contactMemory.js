// Lembra nome e telefone do visitante neste navegador, para não pedir
// de novo a cada imóvel. Nada sai do aparelho além do lead enviado.
const KEY = "ga:contato";

export function readContact() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { name: c.name || "", phone: c.phone || "" };
  } catch {
    return { name: "", phone: "" };
  }
}

export function saveContact({ name, phone }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ name, phone }));
  } catch {
    /* ignore */
  }
}
