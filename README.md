# Gildavi Arnaut Imóveis

Site público e painel do corretor Gildavi Arnaut (Salvador — BA).
React + Vite, React Router 7, MUI (só tema e diálogo), Firebase (Auth, Firestore, Storage), deploy na Vercel.

## Rodando

```bash
npm install
npm run dev
```

## Estrutura

```
src/
  lib/          constantes do negócio, formatação, filtros, WhatsApp
  services/     Firebase: products (leitura normalizada + cache), leads, imagens
  contexts/     Auth, Favoritos (localStorage), Toast
  hooks/        useProducts, useIsNarrow, useDocumentTitle
  components/   Navbar, Footer + CTA, PropertyCard, Lightbox, MapView, PublicLayout...
  pages/
    Home/  Listing/  ProductDetails/  AboutAgent/  Contact/  NotFound/
    LoginPage/  RegisterPage/  EditProfile/
    Admin/      AdminLayout, Overview, PropertiesTable, PropertyForm, Leads
    AddPosts/  AddFeaturedProducts/  RegisterImovel/   (telas antigas mantidas)
```

## Rotas

| Rota | Tela |
|---|---|
| `/` | Home |
| `/imoveis` | Listagem — filtros na URL: `negocio, tipo, bairro, faixa, area, quartos, banheiros, vagas, mobiliado, pet, ordem, kw, view=mapa, favoritos=1` |
| `/product/:id` | Detalhe |
| `/about`, `/contato` | Sobre, Contato |
| `/admin`, `/admin/imoveis`, `/admin/cadastrar`, `/admin/editar/:id`, `/admin/leads` | Painel (somente admins) |

Rotas antigas (`/Sale-Products`, `/Rent-Products`, `/location`, `/filtered-products`,
`/admin/manage-products`, `/add-products`, `/edit-produto/:id`...) redirecionam para as novas.

## Dados

Documentos antigos de `products` continuam válidos: `services/products.js → normalizeProduct`
aplica defaults na leitura (preço em texto vira número, `isFeatured` "sim"/"não" vira boolean,
venda + status "Lançamento" vira negócio `lancamento`). Nada é migrado no banco.
Imóveis salvos pelo painel novo já gravam os campos novos (`title`, `bathrooms`, `condoFee`,
`iptu`, `furnished`, `petFriendly`, `listingStatus`, `deliveryDate`, `lat`, `lng`, `amenities`...).

Leads e contadores de visualização dependem das regras do Firestore — ver `FIRESTORE_RULES.md`.

## Mapa

`components/MapView` é um placeholder com a interface pronta (`markers`, `selectedId`,
`onSelect`). Para Google Maps ou Mapbox, troque a implementação mantendo as props
e preencha latitude/longitude no cadastro do imóvel.

## A confirmar com o cliente

CRECI e Instagram em `src/lib/constants.js` (`AGENT.creci`, `AGENT.instagram`).
O card de Instagram só aparece no Contato quando `AGENT.instagram` estiver preenchido.
