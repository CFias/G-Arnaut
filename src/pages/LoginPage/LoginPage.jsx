// src/Login.js
import React, { useState } from "react";
import { login } from "../../services/FirebaseConfig";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
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
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
