import React from "react";
import { Avatar } from "@mui/material";
import "./styles.css";

export const AboutAgent = () => {
  return (
    <div className="about-agent">
      <div className="agent-header">
        <Avatar
          alt="G-Arnaut"
          src="https://via.placeholder.com/150" // Aqui você pode adicionar a foto do corretor
          sx={{ width: 150, height: 150 }}
        />
        <h2>G-Arnaut - Corretor de Imóveis</h2>
      </div>

      <div className="agent-info">
        <p>
          G-Arnaut é um corretor de imóveis com ampla experiência no mercado
          imobiliário, oferecendo aos seus clientes um atendimento personalizado
          e serviços de alta qualidade. Ele possui um vasto conhecimento sobre o
          mercado local e está sempre atualizado sobre as melhores opções de
          compra, venda e aluguel de imóveis.
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
          Email: <a href="mailto:garnaut@exemplo.com">garnaut@exemplo.com</a>
        </p>
        <p>
          Telefone: <a href="tel:+1234567890">+12 345 678 90</a>
        </p>
      </div>

      <div className="agent-footer">
        <p>
          Entre em contato com G-Arnaut para ajudar a encontrar o imóvel dos
          seus sonhos!
        </p>
      </div>
    </div>
  );
};
