import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ToastProvider } from "./contexts/ToastContext";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import ScrollManager from "./components/ScrollManager/ScrollManager";
import { pageview } from "./gtag";

// ------------------------------------------------------------------
// Público — a home entra no bundle principal (primeira pintura);
// o resto carrega sob demanda.
// ------------------------------------------------------------------
import { Home } from "./pages/Home/Home";

const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));

const Listing = named(() => import("./pages/Listing/Listing"), "Listing");
const ProductDetails = named(() => import("./pages/ProductDetails/ProductDetails"), "ProductDetails");
const AboutAgent = named(() => import("./pages/AboutAgent/AboutAgent"), "AboutAgent");
const Contact = named(() => import("./pages/Contact/Contact"), "Contact");
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Login = lazy(() => import("./pages/LoginPage/LoginPage"));
const Register = lazy(() => import("./pages/RegisterPage/Register"));
const RegisterImovel = lazy(() => import("./pages/RegisterImovel/RegisterImovel.jsx"));

// ------------------------------------------------------------------
// Autenticado / administrativo
// ------------------------------------------------------------------
const EditProfile = lazy(() => import("./pages/EditProfile/EditProfile"));
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout"));
const Overview = lazy(() => import("./pages/Admin/Overview"));
const PropertiesPage = lazy(() => import("./pages/Admin/PropertiesTable"));
const PropertyForm = lazy(() => import("./pages/Admin/PropertyForm"));
const Leads = lazy(() => import("./pages/Admin/Leads"));
const Agenda = lazy(() => import("./pages/Admin/Agenda"));
const AddPosts = named(() => import("./pages/AddPosts/AddPosts"), "AddPosts");
const AddFeaturedProducts = named(
  () => import("./pages/AddFeaturedProducts/AddFeaturedProducts"),
  "AddFeaturedProducts",
);

function RouteLoading() {
  return <div className="page-loading">Carregando…</div>;
}

/** Rotas antigas → nova listagem, preservando a query string. */
function RedirectToListing({ negocio }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  if (negocio && !params.has("negocio")) params.set("negocio", negocio);
  const qs = params.toString();
  return <Navigate to={`/imoveis${qs ? `?${qs}` : ""}`} replace />;
}

function RedirectToEdit() {
  const { id } = useParams();
  return <Navigate to={`/admin/editar/${id}`} replace />;
}

const admin = (el) => <AdminRoute>{el}</AdminRoute>;

function App() {
  const location = useLocation();

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);

  return (
    <AuthProvider>
      <FavoritesProvider>
        <ToastProvider>
          <ScrollManager />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              {/* ---------- Público ---------- */}
              <Route path="/" element={<Home />} />
              <Route path="/imoveis" element={<Listing />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/about" element={<AboutAgent />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-imovel" element={<RegisterImovel />} />

              {/* ---------- Rotas antigas (links já compartilhados) ---------- */}
              <Route path="/Sale-Products" element={<RedirectToListing negocio="venda" />} />
              <Route path="/Rent-Products" element={<RedirectToListing negocio="aluguel" />} />
              <Route path="/location" element={<RedirectToListing negocio="aluguel" />} />
              <Route path="/filtered-products" element={<RedirectToListing />} />
              <Route path="/favorites" element={<Navigate to="/imoveis?favoritos=1" replace />} />
              <Route path="/contact" element={<Navigate to="/contato" replace />} />
              <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/manage-products" element={<Navigate to="/admin/imoveis" replace />} />
              <Route path="/add-products" element={<Navigate to="/admin/cadastrar" replace />} />
              <Route path="/edit-produto/:id" element={<RedirectToEdit />} />
              <Route path="/manage-product/edit-product/:id" element={<RedirectToEdit />} />

              {/* ---------- Autenticado ---------- */}
              <Route
                path="/edit-profile"
                element={
                  <PrivateRoute>
                    <EditProfile />
                  </PrivateRoute>
                }
              />

              {/* ---------- Painel (somente admins) ---------- */}
              <Route path="/admin" element={admin(<AdminLayout />)}>
                <Route index element={<Overview />} />
                <Route path="imoveis" element={<PropertiesPage />} />
                <Route path="cadastrar" element={<PropertyForm key="novo" />} />
                <Route path="editar/:id" element={<PropertyForm />} />
                <Route path="leads" element={<Leads />} />
                <Route path="agenda" element={<Agenda />} />
              </Route>
              <Route path="/add-posts" element={admin(<AddPosts />)} />
              <Route path="/add-dest" element={admin(<AddFeaturedProducts />)} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
