import React from "react";
import { NavLink } from "react-router-dom";
import "./styles.css";
import { Phone } from "@mui/icons-material";
import Logo from "../../assets/image/garnaut-gray-logo-two.png"

export const Navbar = () => {
  return (
    <header className="nav-container">
      <div className="top-nav">
        <h5 className="top-item">
          O seu corretor de imoveis em{" "}
          <span className="top-local">Salvador-BA</span>
        </h5>
        <h5 className="top-item">
          <Phone fontSize="10" className="top-icon" /> 71 9190-0974
        </h5>
      </div>
      <nav className="nav-content">
        <NavLink className="nav-logo-item">
          <img className="nav-logo-img" src={Logo} alt="" />
        </NavLink>
        <ul className="nav-unorderd-list">
          <NavLink className="nav-link-item">Venda</NavLink>
          <NavLink className="nav-link-item">Locação</NavLink>
          <NavLink className="nav-link-item">O corretor</NavLink>
          <NavLink className="nav-link-item">Contato</NavLink>
        </ul>
        <div className="nav-btn">
          <NavLink className="nav-login-btn">Login</NavLink>
          <NavLink className="nav-register-btn">Cadastrar</NavLink>
        </div>
      </nav>
    </header>
  );
};
