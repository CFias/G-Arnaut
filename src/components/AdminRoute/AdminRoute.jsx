import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isAdminUser } from "../../config/adminUsers";

// Antes, só "/dashboard" tinha alguma proteção — "/admin",
// "/admin/manage-products", "/add-products", "/add-posts" e "/add-dest"
// estavam completamente abertas para qualquer visitante que soubesse a
// URL. Este componente centraliza a checagem para todas as rotas
// administrativas.
export default function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="auth-checking">Verificando acesso...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser(currentUser)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
