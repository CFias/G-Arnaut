import React, { useState, useEffect, useRef } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { Banner } from "../../components/Banner/Banner";
import { CardFilter } from "../../components/CardFilter/CardFilter";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import { FeaturedProducts } from "../../components/FeaturedProducts/FeaturedProducts.jsx";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./styles.css";
import { SocialCard } from "../../components/SocialCard/SocialCard.jsx";
import { CookieConsent } from "../../components/CookieConsent/CookieConsent.jsx";

const Section = ({ title, subtitle, loading, children }) => (
  <section className="section-2">
    <h3 className="home-h3">
      {loading ? <Skeleton width={300} /> : title}
      {loading ? (
        <Skeleton width={250} height={30} />
      ) : (
        <p className="home-p">{subtitle}</p>
      )}
    </h3>
    {children}
  </section>
);

export const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [launchProducts, setLaunchProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);

  const itemsPerPage = 15;
  const recentSectionRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeaturedProducts(
          productsArray
            .filter((product) => product.isFeatured?.toLowerCase() === "sim")
            .slice(0, 6)
        );

        setRecentProducts(
          productsArray.filter(
            (product) => product.isFeatured?.toLowerCase() === "não"
          )
        );

        setLaunchProducts(
          productsArray.filter(
            (product) =>
              product.status?.toLowerCase() === "lançamento" ||
              product.status?.toLowerCase() === "lancamento"
          )
        );

        setIsProductsLoaded(true);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProducts();
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.ceil(recentProducts.length / itemsPerPage);
  const paginatedProducts = recentProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      recentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (window.location.pathname === "/") {
      const showFloatingCard = () => {
        const floatingCard = document.getElementById("floating-card");
        floatingCard.style.display = "block";
        setTimeout(() => {
          floatingCard.style.opacity = "1";
        }, 100);
      };

      if (performance.navigation.type === 1) {
        showFloatingCard();
      }

      document.getElementById("close-card")?.addEventListener("click", () => {
        const floatingCard = document.getElementById("floating-card");
        floatingCard.style.opacity = "0";
        setTimeout(() => {
          floatingCard.style.display = "none";
        }, 300);
      });
    }
  }, []);

  return (
    <>
      <Navbar />
      <CookieConsent />
      <main className="home-container">
        <div id="floating-card" className="floating-card">
          <div className="card-content-floating">
            <h4>Bem-vindo ao nosso site!</h4>
            <p>Confira nossos produtos incríveis.</p>
            <button className="close-card" id="close-card">Fechar</button>
          </div>
        </div>

        <section className="section-1">
          <Banner />
        </section>

        <section className="section-card">
          <CardFilter />
        </section>
        <section className="section-3">
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={200} count={2} />
            </SkeletonTheme>
          ) : (
            <>
              <div className="social-cards-wrapper">
                <SocialCard type="instagram" />
              </div>
            </>
          )}
        </section>

        <Section
          title="Imóveis em Destaque"
          subtitle="Imóveis que podem te interessar"
          loading={isLoading}
        >
          <div className="featured-products">
            {isProductsLoaded ? (
              featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <FeaturedProducts key={index} product={product} />
                ))
              ) : (
                <p>Não há produtos em destaque no momento.</p>
              )
            ) : (
              <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
                <Skeleton height={200} count={2} />
              </SkeletonTheme>
            )}
          </div>
        </Section>

        <Section
          title="Lançamentos"
          subtitle="Confira os imóveis recém-lançados"
          loading={isLoading}
        >
          <div className="featured-products">
            {isProductsLoaded ? (
              launchProducts.length > 0 ? (
                launchProducts.map((product, index) => (
                  <FeaturedProducts key={index} product={product} />
                ))
              ) : (
                <p>Não há imóveis com status Lançamento.</p>
              )
            ) : (
              <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
                <Skeleton height={200} count={2} />
              </SkeletonTheme>
            )}
          </div>
        </Section>
        <section className="section-3">
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={200} count={2} />
            </SkeletonTheme>
          ) : (
            <>
              <div className="social-cards-wrapper">
                <SocialCard type="facebook" />
              </div>
            </>
          )}
        </section>
        <section className="section-3" ref={recentSectionRef}>
          <h3 className="home-h3">
            {isLoading ? <Skeleton width={150} /> : "Imóveis Recentes"}
            <p className="home-p">Imóveis adicionados recentemente</p>
          </h3>
          {isLoading ? (
            <div className="skeleton-card">
              <Skeleton height={200} count={2} />
            </div>
          ) : (
            <>
              <div className="featured-products">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, index) => (
                    <FeaturedProducts key={index} product={product} />
                  ))
                ) : (
                  <p>Não há produtos recentes no momento.</p>
                )}
              </div>
              <section className="section-3">
                {isLoading ? (
                  <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
                    <Skeleton height={200} count={2} />
                  </SkeletonTheme>
                ) : (
                  <>
                    <div className="social-cards-wrapper">
                      <SocialCard type="whatsapp" />
                    </div>
                  </>
                )}
              </section>
              {recentProducts.length > itemsPerPage && (
                <>
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <KeyboardArrowLeft fontSize="small" />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        className={currentPage === index + 1 ? "active" : ""}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <KeyboardArrowRight fontSize="small" />
                    </button>
                  </div>
                  <p className="home-p-2">15 imóveis por página</p>
                </>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};
