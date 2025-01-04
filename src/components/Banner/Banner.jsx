import React, { useEffect, useState } from "react";
import { db } from "../../services/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./styles.css";
import Logo from "../../assets/image/garnaut-white-logo.png";
import { Instagram, WhatsApp, YouTube } from "@mui/icons-material";

export const Banner = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isFeatured", "==", "sim")
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeaturedItems(items);
      } catch (error) {
        console.error("Erro ao buscar produtos destacados:", error);
      }
    };

    fetchFeaturedItems();
  }, []);

  useEffect(() => {
    if (featuredItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === featuredItems.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [featuredItems]);

  if (featuredItems.length === 0) {
    return (
      <div className="banner-placeholder">
        <p>Carregando produtos destacados...</p>
      </div>
    );
  }

  return (
    <section className="banner-container">
      <div className="banner-ap">
        <img src={Logo} alt="G-Arnaut" className="banner-logo" />
        <h3>
          Olá, sou G-Arnaut, corretor de imóveis credenciado pelo{" "}
          <span>CRECI-BA 19.425</span>, e estou aqui para ajudá-lo a realizar o
          sonho do imóvel ideal.
        </h3>
        <p>
          Com um atendimento personalizado, foco em suas necessidades e um
          profundo conhecimento do mercado imobiliário da Bahia, meu compromisso
          é oferecer as melhores oportunidades, seja para compra, venda ou
          locação de imóveis. Conte comigo para tornar o processo simples,
          seguro e transparente, com toda a credibilidade que só um corretor
          registrado pode garantir.
        </p>
        <div className="icons-banner">
          <WhatsApp fontSize="small" className="banner-icon" />
          <Instagram fontSize="small" className="banner-icon" />
          <YouTube fontSize="small" className="banner-icon" />
        </div>
      </div>
      {featuredItems.map((item, index) => (
        <div
          key={item.id}
          className={`banner-item ${
            index === currentIndex ? "active" : "hidden"
          }`}
          style={{
            backgroundImage:
              item.images && item.images[0] ? `url(${item.images[0]})` : "none",
          }}
        >
          <div className="banner-overlay">
            <div className="txt-infos"></div>
          </div>
        </div>
      ))}
    </section>
  );
};
