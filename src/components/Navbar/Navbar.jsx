import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Phone,
  Menu,
  HomeRounded,
  StoreRounded,
  LocationCityRounded,
  InfoRounded,
  ShareRounded,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext"; // Importando o contexto de autenticação
import { logout } from "../../services/FirebaseConfig"; // Função de logout
import Logo from "../../assets/image/garnaut-gray-logo-two.png";
import Logo2 from "../../assets/image/garnaut-gray-logo-icon.png";
import "./styles.css";

export const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, loading } = useAuth(); // Obtendo o usuário autenticado e o estado de carregamento

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Chama a função de logout
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) return <div className="loading-main">Loading...</div>; // Exibe um carregando enquanto espera a autenticação

  return (
    <header className="nav-container">
      <div className="top-nav">
        <h5 className="top-item">
          O seu corretor de imóveis em{" "}
          <span className="top-local">Salvador-BA</span>
        </h5>
        <h5 className="top-item">
          <Phone fontSize="10" className="top-icon" /> 71 9190-0974
        </h5>
      </div>

      <nav className="nav-content">
        <NavLink to="/" className="nav-logo-item">
          <div className="menu-icon">
            <Menu className="nav-menu-icon" onClick={toggleSidebar} />
          </div>
          <img className="nav-logo-img" src={Logo} alt="Logo" />
        </NavLink>

        <ul className="nav-unorderd-list">
          <NavLink to="/" className="nav-link-item">
            Início
          </NavLink>
          <NavLink className="nav-link-item">Venda</NavLink>
          <NavLink className="nav-link-item">Locação</NavLink>
          <NavLink className="nav-link-item">O corretor</NavLink>
          <NavLink className="nav-link-item">Contato</NavLink>

          {!currentUser ? (
            <>
              <NavLink to="/login" className="nav-link-item">
                Login
              </NavLink>
              <NavLink to="/register" className="nav-link-item">
                Criar conta
              </NavLink>
            </>
          ) : (
            <li className="nav-link-item">
              Bem-vindo, {currentUser.userName || currentUser.email}{" "}
              {/* Exibe o nome ou email */}
              <button onClick={handleLogout} className="logout-button">
                Sair
              </button>
            </li>
          )}
        </ul>
      </nav>

      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="side-logo">
          <img className="nav-logo-img-side" src={Logo2} alt="Logo" />
        </div>
        <ul className="sidebar-list">
          <NavLink className="sidebar-link-item" onClick={closeSidebar}>
            Início <HomeRounded fontSize="small" />
          </NavLink>
          <NavLink className="sidebar-link-item" onClick={closeSidebar}>
            Venda <StoreRounded fontSize="small" />
          </NavLink>
          <NavLink className="sidebar-link-item" onClick={closeSidebar}>
            Locação <LocationCityRounded fontSize="small" />
          </NavLink>
          <NavLink className="sidebar-link-item" onClick={closeSidebar}>
            O corretor <InfoRounded fontSize="small" />
          </NavLink>
          <NavLink className="sidebar-link-item" onClick={closeSidebar}>
            Contato <ShareRounded fontSize="small" />
          </NavLink>
        </ul>
      </aside>
    </header>
  );
};
