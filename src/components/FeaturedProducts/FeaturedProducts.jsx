import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CropFree,
  DirectionsCar,
  East,
  Hotel,
  Verified,
  ArrowBack,
  ArrowForward,
  FilterList,
} from "@mui/icons-material";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./styles.css";
import Profile from "../../assets/image/arnaut-profile.png";

export const FeaturedProducts = ({ product }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (id) => {
    navigate(`/product/${id}`);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite((prevState) => !prevState);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <div className="featured-card">
          <div className="featured-images">
            <Skeleton height={150} width="100%" />
          </div>
          <div className="featured-infos">{/* ...skeleton content */}</div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!product) return null;

  return (
    <div className="featured-card" onClick={() => handleCardClick(product.id)}>
      {product.images && product.images.length > 0 && (
        <div
          className="featured-images"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <p className="featured-status">
            <span>
              <FilterList fontSize="10" />{" "}
            </span>
            {product.status}
          </p>
          <p className="featured-ref">Ref: {product.refProduct}</p>
          <img
            className="featured-img"
            src={product.images[currentImage]}
            alt="Product"
          />
          {hovered && (
            <>
              <button className="carousel-arrow left" onClick={prevImage}>
                <ArrowBack fontSize="small" />
              </button>
              <button className="carousel-arrow right" onClick={nextImage}>
                <ArrowForward fontSize="small" />
              </button>
            </>
          )}
        </div>
      )}
      <div className="featured-infos">
        <div className="first-item">
          <div className="infos-profile">
            <img
              src={product.author?.photoURL || Profile}
              className="author-avatar"
              alt="Author"
            />
            <span className="author-name">
              {product.author?.userName || "Gildavi Arnaut"}
            </span>
            <Verified className="icon-profile" fontSize="10" />
          </div>
        </div>
        <div className="infos-details">
          <h3 className="featured-city">{product.city}</h3>
          <p className="featured-neighborhood">{product.neighborhood}</p>
          <div className="infos-all">
            <div className="featured-dimension">
              <CropFree className="featured-icon" fontSize="small" />
              <p className="featured-size">{product.dimension} m²</p>
            </div>
            <div className="featured-dimension">
              <Hotel className="featured-icon" fontSize="small" />
              <p className="featured-size">{product.bedrooms}</p>
            </div>
            <div className="featured-dimension">
              <DirectionsCar className="featured-icon" fontSize="small" />
              <p className="featured-size">{product.parkingSpaces}</p>
            </div>
          </div>
          <div className="end-card">
            <div className="featured-price-mod">
              <div className="featured-type">
                <p className="featured-category">{product.category}</p>À
                <p className="featured-category">{product.productType}</p>
              </div>
              <p className="price-name">Preço do imóvel</p>
              <p className="featured-price">R$ {product.price}</p>
            </div>
            <p className="more-imovel">Ver mais</p>
          </div>
        </div>
      </div>
    </div>
  );
};
