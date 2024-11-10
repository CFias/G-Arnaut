import React, { useState } from "react";
import { login } from "../../services/FirebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import { ArrowBack } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
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
        <h2 className="access-title">Acesse a sua conta</h2>
        {currentUser && <p>Bem-vindo, {currentUser.email}</p>}
        <input
          className="access-item"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <div className="password-container">
          <input
            className="access-item"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
          />
          <div className="show-pass">
            Mostrar senha
            <IconButton
              onClick={() => setShowPassword((prev) => !prev)}
              edge="end"
            >
              {showPassword ? (
                <VisibilityOff fontSize="10" />
              ) : (
                <Visibility fontSize="10" />
              )}
            </IconButton>
          </div>
        </div>
        <button className="access-btn" type="submit" disabled={isLoading}>
          {isLoading ? <CircularProgress color="white" size={13} /> : "Entrar"}
        </button>
      </form>
      <div className="access-alt">
        <h3 className="access-sub">Novo por aqui?</h3>
        <p className="access-p">
          Faça já o seu cadastro e encontre <br /> aqui o que você procura
        </p>
        <NavLink className="access-nav" to="/register">
          Criar conta
        </NavLink>
      </div>
    </div>
  );
}
