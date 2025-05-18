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
import { AddPosts } from "./pages/AddPosts/AddPosts";
import { AddProducts } from "./pages/AddProducts/AddProducts";
import RentalsPage from "./pages/RentalsPage/RentalsPage";
import ImportVideo from "./pages/ImportVideo/ImportVideo";
import { EditProduct } from "./components/EditProduct/EditProduct";
import { AddFeaturedProducts } from "./pages/AddFeaturedProducts/AddFeaturedProducts ";
import { RentProducts } from "./pages/RentProducts/RentProducts";
import { SaleProducts } from "./pages/SaleProducts/SaleProducts";
import { AboutAgent } from "./pages/AboutAgent/AboutAgent";
import DynamicTitle from "./components/DynamicTitle/DynamicTitle";
import EditProfile from "./pages/EditProfile/EditProfile";

function App() {
  return (
    <AuthProvider>
      <DynamicTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Rent-Products" element={<RentProducts />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/edit-produto/:id" element={<EditProduct />} />
        <Route path="/Sale-Products" element={<SaleProducts />} />
        <Route path="/about" element={<AboutAgent />} />
        <Route path="/filtered-products" element={<FilteredProducts />} />
        <Route path="/location" element={<RentalsPage />} />
        <Route path="/import-video" element={<ImportVideo />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/add-posts" element={<AddPosts />} />
        <Route path="/add-dest" element={<AddFeaturedProducts />} />
        <Route path="/add-products" element={<AddProducts />} />
        <Route
          path="/admin/manage-products"
          element={<ManageProducts />}
        />{" "}
        <Route
          path="/manage-product/edit-product/:id"
          element={<EditProduct />}
        />{" "}
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
