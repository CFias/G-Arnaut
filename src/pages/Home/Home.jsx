import React, { useState, useEffect } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { Banner } from "../../components/Banner/Banner";
import "./styles.css";
import { ProductsPost } from "../../components/ProductsPost/ProductsPost";
import { CardFilter } from "../../components/CardFilter/CardFilter";
import  VideoList  from "../../components/VideoList/VideoList.jsx";

export const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        <section className="section-1">
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={500} borderRadius={15} />
            </SkeletonTheme>
          ) : (
            <CardFilter />
          )}
        </section>
        <section className="section-2">
          {/* <h3 className="home-h3">{isLoading ? <Skeleton width={150} /> : "Em destaque"}</h3> */}
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={200} />
              <Skeleton height={200} style={{ marginTop: 10 }} />
            </SkeletonTheme>
          ) : (
            <div></div>
          )}
        </section>
        <section className="section-3">
          <h3 className="home-h3">
            {isLoading ? <Skeleton width={150} /> : "Recentes"}
          </h3>
          {isLoading ? (
            <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
              <Skeleton height={200} />
              <Skeleton height={200} style={{ marginTop: 10 }} />
            </SkeletonTheme>
          ) : (
            <ProductsPost />
          )}
        </section>
        <section className="section-3">
          <h3 className="home-h3">
            {isLoading ? <Skeleton width={150} /> : "Recentes"}
          </h3>
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
