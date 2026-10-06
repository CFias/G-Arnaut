// Dados fixos do corretor e vocabulário do catálogo.
// Tudo que aparece em mais de um lugar (número do WhatsApp, rótulos de
// negócio, tipos de imóvel...) mora aqui, para não divergir entre telas.

export const AGENT = {
  name: "Gildavi Arnaut",
  firstName: "Gildavi",
  whatsapp: "5571991900974",
  phoneDisplay: "+55 71 99190-0974",
  phoneHref: "tel:+5571991900974",
  email: "davimarnaut@gmail.com",
  // A confirmar com o cliente
  instagram: "",
  role: "Gestor Imobiliário",
  creci: "CRECI-BA 19.425",
  bio:
    "Realizando sonhos desde 2013, entusiasta e estudioso do mercado imobiliário, com vasta experiência, " +
    "meu compromisso é assessorar-lhe com atendimento personalizado e oportunidades seguras para compra, venda e locação.",
  city: "Salvador",
  state: "BA",
};

export const SITE_URL = "https://www.arnautimoveis.com";

// IDs de conversão do Google Ads já usados no site antigo
export const CONVERSIONS = {
  whatsapp: "AW-16519300622/YTVFCJrxnoUbEI6MgsU9",
  call: "AW-16519300622/7BEFCO_5wYsbEI6MgsU9",
};

// Tipos de negócio. `key` é o valor gravado em `productType` no Firestore
// e o valor usado na URL (?negocio=venda). `group` define como o preço é
// lido: venda (valor cheio), mes (/mês) ou dia (/diária).
export const NEGOCIOS = [
  { key: "venda", label: "Venda", group: "venda", title: ["Imóveis para", "comprar"] },
  { key: "aluguel", label: "Aluguel", group: "mes", title: ["Imóveis para", "alugar"] },
  { key: "lancamento", label: "Lançamentos", group: "venda", title: ["", "Lançamentos"] },
  { key: "temporada", label: "Temporada", group: "dia", title: ["Imóveis para", "temporada"] },
  { key: "comercial", label: "Comercial", group: "mes", title: ["Imóveis para", "empresas"] },
];

export const NEGOCIO_BY_KEY = Object.fromEntries(NEGOCIOS.map((n) => [n.key, n]));

export const negocioLabel = (key) => NEGOCIO_BY_KEY[key]?.label || "Venda";
export const negocioGroup = (key) => NEGOCIO_BY_KEY[key]?.group || "venda";

export const TIPOS = [
  "Apartamento",
  "Casa",
  "Cobertura",
  "Sala Comercial",
  "Loja",
  "Galpão",
  "Terreno",
  "Sítio",
  "Fazenda",
];

// `value` é o que já existe gravado em `status` nos documentos antigos.
export const SITUACOES = [
  { value: "Obra finalizada", label: "Pronto para morar" },
  { value: "Lançamento", label: "Lançamento" },
  { value: "Reformando", label: "Reformando" },
  { value: "Recém reformado", label: "Recém reformado" },
];

export const situacaoLabel = (value) =>
  SITUACOES.find((s) => s.value === value)?.label || value || "";

export const LISTING_STATUS = ["Ativo", "Reservado", "Vendido", "Alugado", "Rascunho"];

// Status que aparecem no site público
export const PUBLIC_STATUS = ["Ativo", "Reservado"];

export const LEAD_STAGES = ["Novo", "Em contato", "Visita marcada", "Fechado"];

// Origem do lead. "whatsapp" e "form" são gravados pelo site;
// os demais só existem em leads cadastrados à mão no painel.
export const LEAD_SOURCES = [
  { value: "whatsapp", label: "WhatsApp (site)" },
  { value: "form", label: "Formulário do site" },
  { value: "visita", label: "Pedido de visita (site)" },
  { value: "alerta", label: "Alerta de imóvel (site)" },
  { value: "telefone", label: "Ligação" },
  { value: "indicacao", label: "Indicação" },
  { value: "instagram", label: "Instagram" },
  { value: "portal", label: "Portal imobiliário" },
  { value: "presencial", label: "Presencial" },
  { value: "outro", label: "Outro" },
];

export const leadSourceLabel = (value) =>
  LEAD_SOURCES.find((s) => s.value === value)?.label || "Outro";

// Faixas de preço por grupo de negócio: [valor, rótulo, min, max]
export const FAIXAS = {
  venda: [
    ["0", "Qualquer valor"],
    ["1", "Até R$ 500 mil", 0, 5e5],
    ["2", "R$ 500 mil – 1 mi", 5e5, 1e6],
    ["3", "R$ 1 – 2 mi", 1e6, 2e6],
    ["4", "Acima de R$ 2 mi", 2e6, Infinity],
  ],
  mes: [
    ["0", "Qualquer valor"],
    ["1", "Até R$ 3 mil", 0, 3000],
    ["2", "R$ 3 – 6 mil", 3000, 6000],
    ["3", "R$ 6 – 10 mil", 6000, 10000],
    ["4", "Acima de R$ 10 mil", 10000, Infinity],
  ],
  dia: [
    ["0", "Qualquer valor"],
    ["1", "Até R$ 400", 0, 400],
    ["2", "R$ 400 – 800", 400, 800],
    ["3", "Acima de R$ 800", 800, Infinity],
  ],
};

// Preposição correta para cada bairro ("na Barra", "no Rio Vermelho")
export const BAIRRO_PREP = {
  Barra: "na",
  "Rio Vermelho": "no",
  Pituba: "na",
  "Horto Florestal": "no",
  "Caminho das Árvores": "no",
  Graça: "na",
  Itaigara: "no",
  Imbuí: "no",
  Federação: "na",
  Vitória: "na",
  Canela: "no",
  "Costa Azul": "na",
  "Jardim Armação": "no",
  Paralela: "na",
};

export const bairroComPrep = (bairro) =>
  bairro ? `${BAIRRO_PREP[bairro] || "em"} ${bairro}` : "";

// Frase curta para os cards de bairro da home
export const BAIRRO_VIBE = {
  Barra: "Pôr do sol no Farol e vida a pé",
  "Rio Vermelho": "Boêmio, criativo e à beira-mar",
  Patamares: "Condomínios verdes perto da orla",
  Ondina: "Orla tranquila e circuito do Carnaval",
  Pituba: "Plano, completo e cheio de serviços",
  "Horto Florestal": "Alto padrão entre árvores",
  "Caminho das Árvores": "O centro de negócios da cidade",
  "Vilas do Atlântico": "Casa de praia em Lauro de Freitas",
  Graça: "Tradição e ruas arborizadas",
  Itaigara: "Residencial e bem localizado",
  Imbuí: "Prático, perto da Paralela",
  "Stella Maris": "Praia, surf e casas amplas",
  Vitória: "Corredor da Vitória, vista para a baía",
  Federação: "Perto da UFBA e do Rio Vermelho",
  Piatã: "Orla larga e coqueiros",
  Itapuã: "Farol, lagoa e praia",
};
