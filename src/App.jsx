// src/App.js
import "./App.css";
import { Navbar } from "./components/Navbar/Navbar";

// Imports Libs
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import Login from "./pages/LoginPage/LoginPage";
import Dashboard from "./components/Dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Register from "./pages/RegisterPage/Register";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
