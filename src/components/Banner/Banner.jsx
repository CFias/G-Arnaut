import React, { useEffect, useState } from "react";
import { db } from "../../services/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { East, KeyboardArrowRight, West } from "@mui/icons-material";
import "./styles.css";
import { CardFilter } from "../CardFilter/CardFilter";

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

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredItems.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="banner-container">
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
            <h1 className="txt-banner">{item.category || "Categoria"}</h1>
            <div className="txt-infos">
              <p>
                {item.parkingSpaces
                  ? `${item.parkingSpaces} Vagas de estacionamento`
                  : "Sem vagas disponíveis"}
              </p>
              <p>
                {item.bedrooms
                  ? `${item.bedrooms} Quartos`
                  : "Sem quartos disponíveis"}
              </p>
            </div>
          </div>
          <div className="arrows-container">
            <button className="arrow-button left" onClick={handlePrevClick}>
              <West fontSize="10" />
            </button>
            <button className="arrow-button right" onClick={handleNextClick}>
              <East fontSize="10" />
            </button>
          </div>
          <div className="dots-container">
            {featuredItems.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="filter">
        <CardFilter />
      </div>
    </section>
  );
};
