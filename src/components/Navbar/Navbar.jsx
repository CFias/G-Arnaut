import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Phone,
  Menu,
  Login,
  Add,
  LogoutRounded,
  HomeOutlined,
  StoreOutlined,
  FavoriteBorderOutlined,
  LocationCity,
  InfoOutlined,
  PhoneAndroidOutlined,
  SettingsOutlined,
  KeyboardArrowRight,
  LogoutOutlined,
  AdminPanelSettingsOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/FirebaseConfig";
import "./styles.css";
import { Avatar } from "@mui/material";

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
        <h5 className="top-item-text">
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
              <NavLink to="/admin" className="nav-link-login">
                ADM
              </NavLink>
              <NavLink onClick={handleLogout} className="logout-button">
                Sair
                <LogoutRounded fontSize="10" />
              </NavLink>
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
        <ul className="sidebar-list">
          <div className="side-items-one">
            {!currentUser ? (
              <>
                <div className="side-items-one-log">
                  <NavLink
                    to="/login"
                    className="sidebar-link-item"
                    onClick={closeSidebar}
                  >
                    <div className="icon-name-side-log">
                      <Login fontSize="small" />
                      Entrar
                    </div>
                    <KeyboardArrowRight fontSize="10" />
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="sidebar-link-item"
                    onClick={closeSidebar}
                  >
                    <div className="icon-name-side-log">
                      <Add fontSize="small" />
                      Cadastre-se
                    </div>
                    <KeyboardArrowRight fontSize="10" />
                  </NavLink>
                </div>
              </>
            ) : (
              <NavLink to="/profile" className="side-user">
                <div className="user-infos">
                  <Avatar />
                  <div className="info-user">
                    <li className="nav-link-name-side">{userName}</li>
                    <p className="nav-link-email-side">{currentUser.email}</p>
                  </div>
                  <KeyboardArrowRight fontSize="10" />
                </div>
              </NavLink>
            )}
          </div>
          <div className="side-items-one">
            <NavLink
              to="/admin"
              className="sidebar-link-item-adm"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <AdminPanelSettingsOutlined fontSize="small" /> Adm
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
          </div>
          <div className="side-items-one">
            <NavLink className="sidebar-link-item" onClick={closeSidebar}>
              <div className="icon-name-side">
                <HomeOutlined fontSize="small" /> Início
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink className="sidebar-link-item" onClick={closeSidebar}>
              <div className="icon-name-side">
                <StoreOutlined fontSize="small" /> Venda
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink className="sidebar-link-item" onClick={closeSidebar}>
              <div className="icon-name-side">
                <LocationCity fontSize="small" /> Locação
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink className="sidebar-link-item" onClick={closeSidebar}>
              <div className="icon-name-side">
                <FavoriteBorderOutlined fontSize="small" /> Favoritos
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
          </div>
          <div className="side-items-one">
            <NavLink className="sidebar-link-item" onClick={closeSidebar}>
              <div className="icon-name-side">
                <PhoneAndroidOutlined fontSize="small" /> Contato
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink className="sidebar-link-item" onClick={closeSidebar}>
              <div className="icon-name-side">
                <InfoOutlined fontSize="small" /> O corretor
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
          </div>
          <div className="side-items-one">
            <NavLink className="sidebar-link-item" onClick={closeSidebar}>
              <div className="icon-name-side">
                <SettingsOutlined fontSize="small" /> Configurações
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
          </div>
          {currentUser ? (
            <div className="side-items-one">
              <NavLink
                className="sidebar-link-item-logout"
                onClick={() => {
                  closeSidebar();
                  handleLogout();
                }}
              >
                <div className="icon-name-side">
                  <LogoutOutlined fontSize="small" />
                  Sair
                </div>
                <KeyboardArrowRight fontSize="10" />
              </NavLink>
            </div>
          ) : null}
        </ul>
      </aside>
    </header>
  );
};
