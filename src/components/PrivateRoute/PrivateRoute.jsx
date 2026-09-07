import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Espera o Firebase confirmar a sessão antes de decidir — evita
  // redirecionar para /login um usuário legítimo só porque a checagem
  // ainda estava em andamento (acontecia sempre que a página era
  // recarregada com F5).
  if (loading) {
    return <div className="auth-checking">Verificando acesso...</div>;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
}
