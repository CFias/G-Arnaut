import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import DynamicTitle from "./components/DynamicTitle/DynamicTitle";
import { pageview } from "./gtag";

// ------------------------------------------------------------------
// ROTAS PÚBLICAS — carregadas normalmente. São as páginas que o
// Google precisa indexar e que a maioria dos visitantes acessa.
// ------------------------------------------------------------------
import { Home } from "./pages/Home/Home";
import Login from "./pages/LoginPage/LoginPage";
import Register from "./pages/RegisterPage/Register";
import { RentProducts } from "./pages/RentProducts/RentProducts";
import { SaleProducts } from "./pages/SaleProducts/SaleProducts";
import { AboutAgent } from "./pages/AboutAgent/AboutAgent";
import { FilteredProducts } from "./components/FilteredProducts/FilteredProducts";
import { ProductDetails } from "./pages/ProductDetails/ProductDetails";
import RentalsPage from "./pages/RentalsPage/RentalsPage";
import RegisterImovel from "./pages/RegisterImovel/RegisterImovel.jsx";

// ------------------------------------------------------------------
// ROTAS AUTENTICADAS (qualquer usuário logado) — lazy, pois um
// visitante anônimo nunca precisa baixar esse código.
// ------------------------------------------------------------------
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const EditProfile = lazy(() => import("./pages/EditProfile/EditProfile"));

// ------------------------------------------------------------------
// ROTAS ADMINISTRATIVAS — lazy + protegidas por AdminRoute. Antes,
// só "/dashboard" tinha alguma proteção; "/admin", "/add-products",
// "/add-posts", "/add-dest" e "/admin/manage-products" estavam
// completamente abertas para qualquer um que soubesse a URL.
// ------------------------------------------------------------------
const Admin = lazy(() => import("./pages/Admin/Admin").then((m) => ({ default: m.Admin })));
const ManageProducts = lazy(() =>
  import("./pages/ManageProducts/ManageProducts").then((m) => ({ default: m.ManageProducts }))
);
const AddProducts = lazy(() =>
  import("./pages/AddProducts/AddProducts").then((m) => ({ default: m.AddProducts }))
);
const AddPosts = lazy(() =>
  import("./pages/AddPosts/AddPosts").then((m) => ({ default: m.AddPosts }))
);
const AddFeaturedProducts = lazy(() =>
  import("./pages/AddFeaturedProducts/AddFeaturedProducts ").then((m) => ({
    default: m.AddFeaturedProducts,
  }))
);
const EditProduct = lazy(() =>
  import("./components/EditProduct/EditProduct").then((m) => ({ default: m.EditProduct }))
);

function RouteLoading() {
  return <div className="admin-loading">Carregando...</div>;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);

  return (
    <AuthProvider>
      <DynamicTitle />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* ---------- Público ---------- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-imovel" element={<RegisterImovel />} />
          <Route path="/Rent-Products" element={<RentProducts />} />
          <Route path="/Sale-Products" element={<SaleProducts />} />
          <Route path="/about" element={<AboutAgent />} />
          <Route path="/filtered-products" element={<FilteredProducts />} />
          <Route path="/location" element={<RentalsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* ---------- Autenticado (qualquer usuário logado) ---------- */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />

          {/* ---------- Administrativo (somente admins) ---------- */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage-products"
            element={
              <AdminRoute>
                <ManageProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/add-products"
            element={
              <AdminRoute>
                <AddProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/add-posts"
            element={
              <AdminRoute>
                <AddPosts />
              </AdminRoute>
            }
          />
          <Route
            path="/add-dest"
            element={
              <AdminRoute>
                <AddFeaturedProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/edit-produto/:id"
            element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/manage-product/edit-product/:id"
            element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
