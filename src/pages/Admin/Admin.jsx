import React, { useState, useEffect } from "react";
import { Modal } from "../../components/Modal/Modal";
import "./styles.css";
import { AddProducts } from "../../components/AddProducts/AddProducts";
import { AddPosts } from "../../components/AddPosts/AddPosts";
import { useAuth } from "../../contexts/AuthContext";
import { AddCircle, AdminPanelSettings, KeyboardBackspace, ManageAccounts, Settings } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { getProductCount, getPostCount } from "../../services/FirebaseConfig";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import { Avatar } from "@mui/material";

export const Admin = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const { currentUser, userName, loading } = useAuth();

  const [productCount, setProductCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const totalProducts = await getProductCount();
      const totalPosts = await getPostCount();
      setProductCount(totalProducts);
      setPostCount(totalPosts);
    };
    fetchCounts();
  }, []);

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <>
      <nav className="nav-admin-container">
        <NavLink className="admin-logo" to="/">
          <img className="nav-admin-img" src={Logo} alt="" />
        </NavLink>
        <NavLink className="admin-icon" to="/">
          <KeyboardBackspace className="nav-admin-icon" />
        </NavLink>
        <input placeholder="Pesquisar" className="nav-admin-in" type="search" />
        <NavLink to="/profile" className="admin-profile">
          <h4 className="admin-name">{userName}</h4>
          <Avatar />
        </NavLink>
      </nav>
      <section className="admin-container">
        <div className="admin-content">
          <div className="admin-graphics">
            <div className="admin-quantity-products">
              <h4 className="graphics-h4">Total de Produtos</h4>
              <span className="quantity-span">{productCount}</span>
            </div>
            <div className="admin-quantity-posts">
              <h4 className="graphics-h4">Total de Posts</h4>
              <span className="quantity-span">{postCount}</span>
            </div>
          </div>
          <div className="admin-cards">
            <div
              onClick={() => openModal(<AddProducts />)}
              className="card-admin"
            >
              <h4 className="admin-h4">Adicione novos imóveis</h4>
              <AddCircle className="admin-icon" fontSize="medium" />
            </div>
            <div onClick={() => openModal(<AddPosts />)} className="card-admin">
              <h4 className="admin-h4">Adicione um novo post para o blog</h4>
              <AddCircle className="admin-icon" fontSize="medium" />
            </div>
            <NavLink to="/manage-products" className="card-admin">
              <h4 className="admin-h4">Gerenciar produtos</h4>
              <AdminPanelSettings
                className="admin-icon"
                fontSize="medium"
              />
            </NavLink>
            <NavLink to="/table-posts" className="card-admin">
              <h4 className="admin-h4">Gerenciar publicações</h4>
              <AdminPanelSettings
                className="admin-icon"
                fontSize="medium"
              />
            </NavLink>
            <NavLink to="/table-posts" className="card-admin">
              <h4 className="admin-h4">Gerenciar usuários</h4>
              <ManageAccounts
                className="admin-icon"
                fontSize="medium"
              />
            </NavLink>
            <NavLink to="/table-posts" className="card-admin">
              <h4 className="admin-h4">Configurações</h4>
              <Settings
                className="admin-icon"
                fontSize="medium"
              />
            </NavLink>
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </>
  );
};
