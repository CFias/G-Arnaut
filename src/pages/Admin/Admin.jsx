// Admin.js
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import "./styles.css";
import { AddProducts } from "../../components/AddProducts/AddProducts";
import { AddPosts } from "../../components/AddPosts/AddPosts";

// Componentes fictícios para cada card
const GeneralTables = () => <div>Tabelas gerais</div>;

export const Admin = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

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
      <section className="admin-container">
        <div className="admin-side">Side</div>
        <div className="admin-content">
          <div className="admin-cards">
            <div className="card-admin">
              <h4>Adicione novos imóveis</h4>
              <button onClick={() => openModal(<AddProducts />)}>Abrir</button>
            </div>
            <div className="card-admin">
              <h4>Adicione um novo post para o blog</h4>
              <button onClick={() => openModal(<AddPosts />)}>Abrir</button>
            </div>
            <div className="card-admin">
              <h4>Tabelas gerais</h4>
              <button onClick={() => openModal(<GeneralTables />)}>
                Abrir
              </button>
            </div>
          </div>
          <div className="admin-graphics">
            <div className="admin-quantity-products">0</div>
            <div className="admin-quantity-posts">0</div>
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </>
  );
};
