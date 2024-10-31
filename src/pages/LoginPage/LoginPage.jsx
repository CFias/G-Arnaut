import React, { useState } from "react";
import { login } from "../../services/FirebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // Importa o useNavigate

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Inicializa o useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // Tenta fazer login
      navigate("/"); // Redireciona para a página inicial após login bem-sucedido
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {currentUser && <p>Bem-vindo, {currentUser.email}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required // Adiciona validação
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required // Adiciona validação
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
