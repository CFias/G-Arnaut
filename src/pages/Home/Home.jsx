import React, { useState, useEffect } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { Banner } from "../../components/Banner/Banner";
import "./styles.css";
import { ProductsPost } from "../../components/ProductsPost/ProductsPost";
import { CardFilter } from "../../components/CardFilter/CardFilter";
import VideoList from "../../components/VideoList/VideoList.jsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import { FeaturedProducts } from "../../components/FeaturedProducts/FeaturedProducts.jsx";

export const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtra os produtos em destaque
        const filteredFeatured = productsArray.filter(
          (product) => product.isFeatured === "sim"
        );
        setFeaturedProducts(filteredFeatured);

        // Filtra os produtos recentes, excluindo os produtos em destaque
        const filteredRecent = productsArray.filter(
          (product) => product.isFeatured == false
        );
        setRecentProducts(filteredRecent.slice(0, 6)); // Exemplo: mostrar 6 produtos recentes
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProducts();

    // Simulação de carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main className="home-container">
        <section className="section-1">
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={500} borderRadius={15} />
            </SkeletonTheme>
          ) : (
            <Banner />
          )}
        </section>

        {/* Filter Section */}
        <section className="section-1">
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={500} borderRadius={15} />
            </SkeletonTheme>
          ) : (
            <CardFilter />
          )}
        </section>

        {/* Featured Products Section */}
        <section className="section-2">
          <h3 className="home-h3">
            {isLoading ? <Skeleton width={150} /> : "Imóveis em Destaque"}
          </h3>
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={200} />
              <Skeleton height={200} style={{ marginTop: 10 }} />
            </SkeletonTheme>
          ) : (
            <div className="featured-products">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <FeaturedProducts key={index} product={product} />
                ))
              ) : (
                <p>Não há produtos em destaque no momento.</p>
              )}
            </div>
          )}
        </section>

        <section className="section-3">
          <h3 className="home-h3">
            {isLoading ? <Skeleton width={150} /> : "Imóveis Recentes"}
          </h3>
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={200} />
              <Skeleton height={200} style={{ marginTop: 10 }} />
            </SkeletonTheme>
          ) : (
            <div className="featured-products">
              {recentProducts.length > 0 ? (
                recentProducts.map((product, index) => (
                  <FeaturedProducts key={index} product={product} />
                ))
              ) : (
                <p>Não há produtos em destaque no momento.</p>
              )}
            </div>
          )}
        </section>

        {/* Video Section */}
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
