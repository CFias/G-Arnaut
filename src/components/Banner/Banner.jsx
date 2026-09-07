import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Skeleton from "react-loading-skeleton";
import Slider from "react-slick";
import "./styles.css";
import arnautbanner from "../../assets/image/arnautbanner3.webp";
import {
  Instagram,
  WhatsApp,
  YouTube,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";

// setas
const CustomPrevArrow = ({ onClick }) => (
  <div className="custom-arrow custom-prev" onClick={onClick}>
    <ArrowBackIos fontSize="small" />
  </div>
);

const CustomNextArrow = ({ onClick }) => (
  <div className="custom-arrow custom-next" onClick={onClick}>
    <ArrowForwardIos fontSize="small" />
  </div>
);

export const Banner = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedItems = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isFeatured", "==", "sim"),
        );

        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMounted) {
          setFeaturedItems(items);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos destacados:", error);
      }
    };

    fetchFeaturedItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClick = useCallback(
    (id) => {
      navigate(`/product/${id}`);
    },
    [navigate],
  );

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    pauseOnHover: true,
    centerMode: true,
    centerPadding: "0px",
    lazyLoad: "ondemand",
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="banner-container">
      <div className="banner-content">
        <div className="banner-ap">
          <div className="banner-names">
            <div className="banner-intro">
              <h3>Gildavi Arnaut</h3>
              <h4>Gestor Imobiliário</h4>
              <h5>CRECI-Ba 19.425</h5>

              <p>
                Realizando sonhos desde 2013, entusiasta e estudioso do mercado
                imobiliário, com vasta experiência, meu compromisso é
                assessorar-lhe com atendimento personalizado e oportunidades
                seguras para compra, venda e locação.
              </p>

              <div className="social-icons">
                <a
                  href="https://wa.me/5571991900974"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <WhatsApp className="social-icon" />
                </a>
                <a
                  href="https://instagram.com/garnautcorretor"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="social-icon" />
                </a>
                <a
                  href="https://youtube.com/@garnautcorretor"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <YouTube className="social-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <img src={arnautbanner} alt="Gildavi Arnaut" className="banner-img" />

        {/* Esta é a maior imagem visível ao carregar a página (LCP) —
            NÃO deve ter lazy loading, que só deveria ser usado em
            imagens fora da tela inicial. Aplicado aqui, ele atrasava
            o próprio carregamento em vez de acelerar. */}
      </div>
    </section>
  );
};
