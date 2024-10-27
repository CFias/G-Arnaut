// src/components/Register.jsx
import React, { useState } from "react";
import { signup } from "../../services/FirebaseConfig"; // Função para registrar o usuário
import { useAuth } from "../../contexts/AuthContext"; // Para obter o usuário autenticado
import { useNavigate } from "react-router-dom"; // Importa o useNavigate
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth"; // Importa o método para verificar o email
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Importa Firestore

export default function Register() {
  const [userName, setUserName] = useState(""); // Novo estado para o nome de usuário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Novo estado para confirmar a senha
  const { currentUser } = useAuth(); // Pegar o usuário autenticado, se existir
  const navigate = useNavigate(); // Inicializa o useNavigate
  const db = getFirestore(); // Inicializa Firestore

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se as senhas coincidem
    if (password !== confirmPassword) {
      console.error("As senhas não coincidem.");
      return; // Evita o registro se as senhas não coincidirem
    }

    const auth = getAuth();

    try {
      // Verifica se o email já está em uso
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        console.error("Este email já está em uso.");
        return; // Evita o registro se o email já existir
      }

      // Registrar novo usuário
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // Salvar o nome de usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        userName, // Armazena o nome de usuário
        email, // Armazena o email
      });

      navigate("/"); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
    }
  };

  return (
    <div>
      <h2>Registrar</h2>
      {currentUser && <p>Bem-vindo, {currentUser.email}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Nome de Usuário"
          required // Adiciona validação
        />
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirme a Senha"
          required // Adiciona validação
        />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}
