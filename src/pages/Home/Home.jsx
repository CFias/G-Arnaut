import React, { useState, useEffect } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { Banner } from "../../components/Banner/Banner";
import { CardFilter } from "../../components/CardFilter/CardFilter";
import VideoList from "../../components/VideoList/VideoList.jsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import { FeaturedProducts } from "../../components/FeaturedProducts/FeaturedProducts.jsx";
import "./styles.css";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

export const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredFeatured = productsArray.filter(
          (product) => product.isFeatured?.toLowerCase() === "sim"
        );
        setFeaturedProducts(filteredFeatured.slice(0, 5));

        const filteredRecent = productsArray.filter(
          (product) => product.isFeatured?.toLowerCase() === "não"
        );
        setRecentProducts(filteredRecent);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProducts();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.ceil(recentProducts.length / itemsPerPage);

  const paginatedProducts = recentProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Função para alternar a página
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <>
      <Navbar />
      <main className="home-container">
        <section className="section-1">
          <Banner />
        </section>
        <section className="section-card">
          <CardFilter />
        </section>
        <section className="section-2">
          <h3 className="home-h3">
            {isLoading ? <Skeleton width={370} /> : "Imóveis em Destaque"}
            {isLoading ? (
              <Skeleton width={250} height={30} />
            ) : (
              <p className="home-p">Imóveis que podem te interessar</p>
            )}
          </h3>
          <div className="featured-products">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <FeaturedProducts key={index} product={product} />
              ))
            ) : (
              <p>Não há produtos em destaque no momento.</p>
            )}
          </div>
        </section>
        <section className="section-3">
          <h3 className="home-h3">
            {isLoading ? <Skeleton width={150} /> : "Imóveis Recentes"}
            <p className="home-p">Imóveis adicionados recentemente</p>
          </h3>
          {isLoading ? (
            <div className="skeleton-card">
              <Skeleton height={200} />
              <Skeleton height={200} style={{ marginTop: 10 }} />
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
        <section className="section-3">
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={200} />
              <Skeleton height={200} style={{ marginTop: 10 }} />
            </SkeletonTheme>
          ) : (
            <VideoList />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};
