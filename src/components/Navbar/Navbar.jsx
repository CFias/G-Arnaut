import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Phone,
  Menu as MenuIcon,
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
  AdminPanelSettingsOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/FirebaseConfig"; // Importa a função de logout
import "./styles.css";
import { Avatar, Menu, MenuItem } from "@mui/material";
import Logo from "../../assets/image/garnaut-white-logo.png";
import BanderOne from "../../assets/image/brazil-bander.png";
import Profile from "../../assets/image/arnaut-profile.png";

export const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // Estado para o menu do avatar
  const { currentUser, userName, loading, photoURL } = useAuth();

  const allowedUIDs = [
    "SCQFrh1l7iVOKNbsInx0JGgT9ww1",
    "KduymIJGpXciGs7UlcN3uylAXBZ2",
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Chama a função de logout do Firebase
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
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

  const hasAdminAccess = allowedUIDs.includes(currentUser?.uid);

  return (
    <header className="nav-container">
      <div className="top-nav">
        <h5 className="top-item-text">
          O seu corretor de imóveis em{" "}
          <span className="top-local">Salvador-BA</span>
          <img className="bander-icon" src={BanderOne} alt="Brasil" />
        </h5>
        <a
          href="https://wa.me/5571991900974"
          target="_blank"
          rel="noopener noreferrer"
          className="top-item-phone"
          onClick={() => {
            if (window.gtag) {
              window.gtag("event", "conversion", {
                send_to: "AW-16519300622/YTVFCJrxnoUbEI6MgsU9",
              });
            }
          }}
        >
          <Phone fontSize="10" className="top-icon" /> 71 99190-0974
        </a>
      </div>

      <nav className="nav-content">
        <NavLink to="/" className="nav-logo-item">
          <div className="menu-icon">
            <MenuIcon className="nav-menu-icon" onClick={toggleSidebar} />
          </div>
        </NavLink>
        <ul
          id="navList"
          className={`nav-unorderd-list ${isSticky ? "sticky" : ""}`}
        >
          <div className="sticky-content">
            <div className="nav-logo-name-list">
              <img src={Logo} alt="G Arnaut" className="nav-logo" />
              <h5>G Arnaut</h5>
            </div>
            <div className="nav-links">
              <NavLink to="/" className="nav-link-item">
                Início
              </NavLink>
              <NavLink to="/Sale-Products" className="nav-link-item">
                Imóveis
              </NavLink>
              <NavLink to="/about" className="nav-link-item">
                O corretor
              </NavLink>
            </div>
            <div className="nav-btn">
              {!currentUser ? (
                <>
                  <NavLink to="/login" className="nav-link-login">
                    Login
                  </NavLink>
                  {/* <NavLink to="/register" className="nav-link-register">
                    Criar conta
                  </NavLink> */}
                </>
              ) : (
                <div className="nav-profile">
                  <Avatar
                    onClick={handleOpenMenu}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: "#051426",
                      fontSize: "14px",
                    }}
                  >
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </Avatar>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{ style: { width: "250px" } }}
                  >
                    <MenuItem className="nav-welcome" disabled>
                      Bem-vindo, {userName}
                    </MenuItem>
                    {hasAdminAccess && (
                      <MenuItem>
                        <NavLink to="/admin" className="nav-link-login">
                          Administrar
                        </NavLink>
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        handleLogout();
                      }}
                      className="logout-button"
                    >
                      Sair
                      <LogoutRounded
                        fontSize="10"
                        style={{ marginLeft: "8px" }}
                      />
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>
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
                  <img
                    onClick={handleOpenMenu}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#051426",
                      fontSize: "14px",
                      borderRadius: "50%", // para ficar redonda, tipo avatar
                      width: "40px", // ajuste o tamanho que quiser
                      height: "40px",
                      objectFit: "cover",
                    }}
                    src={photoURL || Profile}
                    alt="Profile"
                  />
                  <div className="info-user">
                    <li className="nav-link-name-side">{userName}</li>
                    <p className="nav-link-email-side">{currentUser.email}</p>
                  </div>
                </div>
              </NavLink>
            )}
          </div>
          <div className="side-items-one">
            {hasAdminAccess && (
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
            )}
          </div>
          <div className="side-items-one">
            <NavLink
              to="/"
              className="sidebar-link-item"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <HomeOutlined fontSize="small" /> Início
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink
              to="/Sale-Products"
              className="sidebar-link-item"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <StoreOutlined fontSize="small" /> Venda
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink
              to="/location"
              className="sidebar-link-item"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <LocationCity fontSize="small" /> Locação
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink
              to="/favorites"
              className="sidebar-link-item"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <FavoriteBorderOutlined fontSize="small" /> Favoritos
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
          </div>
          <div className="side-items-one">
            <NavLink
              to="/contact"
              className="sidebar-link-item"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <PhoneAndroidOutlined fontSize="small" /> Contato
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
            <NavLink
              to="/about"
              className="sidebar-link-item"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <InfoOutlined fontSize="small" /> O corretor
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
          </div>
          <div className="side-items-one">
            <NavLink
              to="/settings"
              className="sidebar-link-item"
              onClick={closeSidebar}
            >
              <div className="icon-name-side">
                <SettingsOutlined fontSize="small" /> Configurações
              </div>
              <KeyboardArrowRight fontSize="10" />
            </NavLink>
          </div>
        </ul>
      </aside>
    </header>
  );
};
