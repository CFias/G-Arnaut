import React, { useState } from "react";
import { signup } from "../../services/FirebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { ArrowBack } from "@mui/icons-material";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import CircularProgress from "@mui/material/CircularProgress";

export default function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const checkPasswordStrength = (password) => {
    let strength = "";
    if (password.length >= 8) {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const score = [
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
      ].filter(Boolean).length;

      if (score === 4) strength = "Forte";
      else if (score === 3) strength = "Média";
      else strength = "Fraca";
    } else {
      strength = "Muito fraca";
    }
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      console.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true); // Set loading to true at the start
    const auth = getAuth();

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        console.error("Este email já está em uso.");
        setIsLoading(false);
        return;
      }

      const userCredential = await signup(email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        userName,
        email,
      });

      setUserName(userName);
      navigate("/");
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
    } finally {
      setIsLoading(false); // Reset loading state after registration completes
    }
  };

  return (
    <div className="access-container">
      <form className="access-form" onSubmit={handleSubmit}>
        <NavLink to="/" className="access-back">
          <ArrowBack fontSize="10" /> Início
        </NavLink>
        <div className="access-logo">
          <img className="access-img" src={Logo} alt="" />
        </div>
        <h2 className="access-title">Faça já o seu cadastro</h2>
        {currentUser && <p>Bem-vindo, {currentUser.email}</p>}
        <input
          className="access-item"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Nome de Usuário"
          required
        />
        <input
          className="access-item"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="access-item"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Senha"
          required
        />
        <input
          className="access-item"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirme a Senha"
          required
        />
        <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
          Força da senha: {passwordStrength}
        </p>
        <button className="access-btn" type="submit" disabled={isLoading}>
          {isLoading ? <CircularProgress color="white" size={13} /> : "Registrar"}
        </button>
      </form>
      <div className="access-alt">
        <h3 className="access-sub">Já possui conta?</h3>
        <p className="access-p">
          Faça já o seu login e encontre <br /> aqui o que você procura
        </p>
        <NavLink className="access-nav" to="/login">
          Login
        </NavLink>
      </div>
    </div>
  );
}
