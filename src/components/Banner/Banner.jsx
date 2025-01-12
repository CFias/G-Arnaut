import React, { useEffect, useState } from "react";
import { db } from "../../services/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./styles.css";
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
        <h3>
          Olá, Sou Gildavi Arnaut, Gestor Imobiliário,{" "}
          <span>CRECI-Ba 19.425</span>, minha missão é auxiliar na concretização
          do sonho do imóvel ideal
        </h3>
        <p>
          Realizando sonhos desde 2013, entusiasta e estudioso do mercado
          imobiliário, com vasta experiência, meu compromisso é assessorar-lhe,
          da melhor forma possível, com atendimento personalizado, focado em
          suas necessidades, oferecendo sempre as melhores oportunidades para
          venda, compra e locação, através de um processo seguro e transparente
          que somente um profissional qualificado pode lhe oferecer.
        </p>
        <div className="icons-banner">
          <WhatsApp fontSize="small" className="banner-icon" />
          <Instagram fontSize="small" className="banner-icon" />
          <YouTube fontSize="small" className="banner-icon" />
        </div>
      </div>
      <div className="carousel">
        {featuredItems.map((item, index) => (
          <div
            key={item.id}
            className={`banner-item ${
              index === currentIndex ? "active" : "hidden"
            }`}
            style={{
              backgroundImage:
                item.images && item.images[0]
                  ? `url(${item.images[0]})`
                  : "none",
            }}
          ></div>
        ))}
      </div>
    </section>
  );
};
