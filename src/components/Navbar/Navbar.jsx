import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Phone,
  Menu,
  HomeRounded,
  StoreRounded,
  LocationCityRounded,
  InfoRounded,
  ShareRounded,
  Login,
  Add,
  LogoutRounded,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/FirebaseConfig";
import Logo from "../../assets/image/garnaut-gray-logo-two.png";
import Logo2 from "../../assets/image/garnaut-gray-logo-icon.png";
import "./styles.css";

export const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { currentUser, userName, loading } = useAuth(); // Ajusta para currentUser e userName

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const navList = document.getElementById("navList");
      if (navList) {
        const stickyStart = navList.offsetTop;
        setIsSticky(window.pageYOffset > stickyStart);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading) return <div className="loading-main">Loading...</div>;

  return (
    <header className="nav-container">
      <div className="top-nav">
        <h5 className="top-item">
          O seu corretor de imóveis em{" "}
          <span className="top-local">Salvador-BA</span>
        </h5>
        <div className="nav-btn">
          <h5 className="top-item">
            <Phone fontSize="10" className="top-icon" /> 71 9190-0974
          </h5>
          {!currentUser ? (
            <>
              <NavLink to="/login" className="nav-link-login">
                Login
              </NavLink>
              <NavLink to="/register" className="nav-link-register">
                Criar conta
              </NavLink>
            </>
          ) : (
            <>
              <li className="nav-link-name">Bem-vindo, {userName}</li>
              <button onClick={handleLogout} className="logout-button">
                Sair
                <LogoutRounded fontSize="10" />
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="nav-content">
        <NavLink to="/" className="nav-logo-item">
          <div className="menu-icon">
            <Menu className="nav-menu-icon" onClick={toggleSidebar} />
          </div>
        </NavLink>

        <ul
          id="navList"
          className={`nav-unorderd-list ${isSticky ? "sticky" : ""}`}
        >
          <div className="nav-links">
            <NavLink to="/" className="nav-link-item">
              Início
            </NavLink>
            <NavLink className="nav-link-item">Venda</NavLink>
            <NavLink className="nav-link-item">Locação</NavLink>
            <NavLink className="nav-link-item">O corretor</NavLink>
            <NavLink className="nav-link-item">Contato</NavLink>
          </div>
        </ul>
      </nav>

      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="side-logo">
          <img className="nav-logo-img-side" src={Logo2} alt="Logo" />
          <div className="side-links">
            {!currentUser ? (
              <>
                <NavLink to="/login" className="side-link-item" onClick={closeSidebar}>
                  Entrar <Login fontSize="small" />
                </NavLink>
                <NavLink to="/register" className="side-link-item" onClick={closeSidebar}>
                  Cadastre-se <Add fontSize="small" />
                </NavLink>
              </>
            ) : (
              <>
                <li className="nav-link-name">Bem-vindo, {userName}</li>
                <button onClick={handleLogout} className="logout-button">
                  Sair
                  <LogoutRounded fontSize="10" />
                </button>
              </>
            )}
          </div>
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
