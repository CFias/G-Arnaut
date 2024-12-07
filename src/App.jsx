import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import Login from "./pages/LoginPage/LoginPage";
import Dashboard from "./components/Dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Register from "./pages/RegisterPage/Register";
import { Admin } from "./pages/Admin/Admin";
import { FilteredProducts } from "./components/FilteredProducts/FilteredProducts";
import { ManageProducts } from "./pages/ManageProducts/ManageProducts";
import { ProductDetails } from "./pages/ProductDetails/ProductDetails";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/filtered-products" element={<FilteredProducts />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/manage-products" element={<ManageProducts />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
