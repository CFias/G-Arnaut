import React from "react";
import instaImg from "../../assets/image/instaImg.png";
import whatsappImg from "../../assets/image/wppImg.png";
import facebookImg from "../../assets/image/faceImg.png";
import "./styles.css";
import { East } from "@mui/icons-material";

const socialData = {
  instagram: {
    image: instaImg,
    alt: "Instagram",
    title: "Siga-me no Instagram e fique por dentro de todas as novidades",
    description: "Tudo em primeira mão",
    buttonText: "Seguir",
    url: "https://www.instagram.com/arnaut_corretor_de_imoveis/",
  },
  whatsapp: {
    image: whatsappImg,
    alt: "WhatsApp",
    title: "Converse comigo no WhatsApp",
    description: "Atendimento rápido e direto",
    buttonText: "Enviar mensagem",
    url: "https://wa.me/+557191900974",
  },
  facebook: {
    image: facebookImg,
    alt: "Facebook",
    title: "Curta nossa página no Facebook",
    description: "Fique atualizado com nossos posts",
    buttonText: "Curtir",
    url: "https://www.facebook.com/share/1DdWamTSJw/",
  },
};

export const SocialCard = ({ type }) => {
  const social = socialData[type];

  if (!social) {
    return null; 
  }

  const handleClick = () => {
    window.open(social.url, "_blank");
  };

  return (
    <div className="social-container">
      <div className="social-card-content">
        <div className="social-card">
          <img className="social-image" src={social.image} alt={social.alt} />
          <div className="social-info">
            <h4>{social.title}</h4>
            <p>{social.description}</p>
          </div>
        </div>
        <div className="cx-btn">
          <button className="follow-button" onClick={handleClick}>
            {social.buttonText} <East fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
};
