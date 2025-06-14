import React from "react";
import { Navbar } from "../../components/Navbar/Navbar";
import "./styles.css";
import agentImage from "../../assets/image/arnaut-profile.jpg"; // fallback
import { useAuth } from "../../contexts/AuthContext"; // ajuste o caminho se necessário
import Profile from "../../assets/image/arnaut-profile.png"; // imagem padrão

export const AboutAgent = () => {
  const { currentUser } = useAuth();
  const profilePhoto = currentUser?.photoURL || Profile;

  return (
    <>
      <Navbar />
      <div className="about-agent">
        <div className="agent-header">
          <img
            className="agent-profile"
            src={profilePhoto}
            alt="Foto do agente"
          />
          <h2>G-Arnaut - Corretor de Imóveis</h2>
        </div>

        <div className="agent-info">
          <p>
            G-Arnaut é um corretor de imóveis com ampla experiência no mercado
            imobiliário, oferecendo aos seus clientes um atendimento
            personalizado e serviços de alta qualidade. Ele possui um vasto
            conhecimento sobre o mercado local e está sempre atualizado sobre as
            melhores opções de compra, venda e aluguel de imóveis.
          </p>

          <h3>Serviços:</h3>
          <ul>
            <li>Consultoria para compra, venda e aluguel de imóveis</li>
            <li>Avaliação imobiliária</li>
            <li>Assessoria em financiamento e documentação</li>
            <li>Visitas e tour guiado pelos imóveis</li>
          </ul>

          <h3>Contato:</h3>
          <p>
            Email:{" "}
            <a href="mailto:davimarnaut@gmail.com">davimarnaut@gmail.com</a>
          </p>
          <p>
            Telefone: <a href="tel:+5571991900974">+55 71 99190-0974</a>
          </p>
        </div>

        <div className="agent-footer">
          <p>
            Entre em contato com G-Arnaut para ajudar a encontrar o imóvel dos
            seus sonhos!
          </p>
        </div>
      </div>
    </>
  );
};
