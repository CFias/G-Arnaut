import React, { useState } from "react";
import instaImg from "../../assets/image/instaImg.png";
import whatsappImg from "../../assets/image/wppImg.png";
import facebookImg from "../../assets/image/faceImg.png";
import { East } from "@mui/icons-material";
import "./styles.css";

const socialData = {
  instagram: {
    image: instaImg,
    alt: "Instagram",
    title: "Siga-me no Instagram e fique por dentro de todas as novidades",
    description: "Tudo em primeira mão",
    buttonText: "Seguir",
    url: "https://www.instagram.com/arnaut_corretor_de_imoveis/",
    sendTo: "AW-16519300622/INSTAGRAM_ID",
  },
  whatsapp: {
    image: whatsappImg,
    alt: "WhatsApp",
    title: "Converse comigo",
    description: "Atendimento rápido e direto",
    buttonText: "Conversar",
    url: "https://wa.me/557191900974",
    sendTo: "AW-16519300622/YTVFCJrxnoUbEI6MgsU9",
    phoneUrl: "tel:+5571991900974",
    phoneSendTo: "AW-16519300622/7BEFCO_5wYsbEI6MgsU9",
  },
  facebook: {
    image: facebookImg,
    alt: "Facebook",
    title: "Curta nossa página no Facebook",
    description: "Fique atualizado com nossos posts",
    buttonText: "Curtir",
    url: "https://www.facebook.com/share/1DdWamTSJw/",
    sendTo: "AW-16519300622/FACEBOOK_ID",
  },
};

export const SocialCard = ({ type }) => {
  const social = socialData[type];
  const [showOptions, setShowOptions] = useState(false);

  if (!social) return null;

  const handleClick = (url, sendTo) => {
    if (typeof window.gtag === "function" && sendTo) {
      window.gtag("event", "conversion", { send_to: sendTo });
    }

    setTimeout(() => {
      window.open(url, "_blank");
    }, 400);
  };

  return (
    <div className="social-container">
      <div className="social-card-content">
        <div className="social-card">
          <img src={social.image} alt={social.alt} className="social-image" />
          <div className="social-info">
            <h4>{social.title}</h4>
            <p>{social.description}</p>
          </div>
        </div>

        <div className="cx-btn">
          {type === "whatsapp" ? (
            <div>
              <button
                className="follow-button"
                onClick={() => setShowOptions(!showOptions)}
              >
                {social.buttonText} <East fontSize="small" />
              </button>

              {showOptions && (
                <div>
                  <button
                    className="follow-button"
                    onClick={() => handleClick(social.url, social.sendTo)}
                  >
                    WhatsApp
                  </button>
                  <button
                    className="follow-button"
                    onClick={() =>
                      handleClick(social.phoneUrl, social.phoneSendTo)
                    }
                  >
                    Ligar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="follow-button"
              onClick={() => handleClick(social.url, social.sendTo)}
            >
              {social.buttonText} <East fontSize="small" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
