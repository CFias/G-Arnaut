import React from "react";
import "./styles.css";
import { NavLink } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <h3>Conquiste o seu imóvel</h3>
        <div className="footer-infos">
          <div className="info-footer">
            <h4>Redes</h4>
            <NavLink className="link-footer">WhatsApp</NavLink>
            <NavLink className="link-footer">Instagram</NavLink>
            <NavLink className="link-footer">YouTube</NavLink>
          </div>
          <div className="info-footer">
            <h4>Atendimento personalizado</h4>
            <NavLink className="link-footer">Falar com o corretor</NavLink>
            <NavLink className="link-footer">
              Personalizar via formulário
            </NavLink>
          </div>
          <div className="info-footer">
            <h4>Precisando de um corretor ?</h4>
            <NavLink className="link-footer">Fale comigo</NavLink>
            <NavLink className="link-footer">E-mail</NavLink>
          </div>
          <div className="info-footer">
            <h4>Deseja vender um imóvel ?</h4>
            <NavLink className="link-footer">Falar com o corretor</NavLink>
            <NavLink className="link-footer">Apresentar imóvel</NavLink>
          </div>
          <div className="info-footer">
            <h4>Confira a minha biografia</h4>
            <NavLink className="link-footer">Saiba mais sobre mim</NavLink>
            <NavLink className="link-footer">Contatos</NavLink>
          </div>
        </div>
      </div>
      <div className="footer-content-two">
        <div className="info-footer">
          <h4>Atendimento</h4>
          <NavLink className="link-footer">Suporte</NavLink>
        </div>
        <div className="info-footer">
          <h4>O que você procura ?</h4>
          <NavLink className="link-footer">Imóveis à venda</NavLink>
          <NavLink className="link-footer">Imóveis para alugar</NavLink>
        </div>
        <div className="info-footer">
          <h4>Confira os tipos de imóveis:</h4>
          <NavLink className="link-footer">Casa</NavLink>
          <NavLink className="link-footer">Apartamento</NavLink>
          <NavLink className="link-footer">Galpão</NavLink>
          <NavLink className="link-footer">Sitio</NavLink>
          <NavLink className="link-footer">Fazenda</NavLink>
          <NavLink className="link-footer">Terreno</NavLink>
        </div>
        <div className="info-footer">
          <h4>Minha credencial</h4>
          <NavLink className="link-footer">Conferir</NavLink>
        </div>
        <div className="info-footer">
          <h4>Condições para adquirir seu imóvel</h4>
          <NavLink className="link-footer">Conferir</NavLink>
        </div>
      </div>
      <div className="footer-power-by">
        <span>
          {`Powered by `}
          <a
            href="https://yourwebsite.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cleidson Fias
          </a>
          {` © ${new Date().getFullYear()} - Todos os direitos reservados.`}
        </span>
      </div>
    </footer>
  );
};
