import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CropFree,
  DirectionsCar,
  Hotel,
  Verified,
  ArrowBack,
  ArrowForward,
  FilterList,
} from "@mui/icons-material";
import "./styles.css";
import Profile from "../../assets/image/arnaut-profile.png";

const FeaturedProductsComponent = ({ product }) => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [hovered, setHovered] = useState(false);

  const images = useMemo(() => product?.images || [], [product]);

  const handleCardClick = useCallback(() => {
    if (product?.id) navigate(`/product/${product.id}`);
  }, [navigate, product]);

  const nextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, [images.length]);

  const prevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  if (!product) return null;

  return (
    <div className="featured-card" onClick={handleCardClick}>
      {images.length > 0 && (
        <div
          className="featured-images"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <p className="featured-status">
            <span>
              <FilterList fontSize="small" />
            </span>
            {product.status}
          </p>

          <p className="featured-ref">Ref: {product.refProduct}</p>

          <img
            className="featured-img"
            src={images[currentImage]}
            srcSet={`
              ${images[currentImage]}?w=400 400w,
              ${images[currentImage]}?w=800 800w
            `}
            sizes="(max-width:768px) 400px, 800px"
            alt={`Imagem do imóvel ${product.refProduct}`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.src = "/placeholder-imovel.webp";
            }}
          />

          {hovered && images.length > 1 && (
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
              loading="lazy"
              decoding="async"
            />

            <span className="author-name">
              {product.author?.userName || "Gildavi Arnaut"}
            </span>

            <Verified className="icon-profile" fontSize="small" />
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
                <p className="featured-category">{product.category}</p> -
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

export const FeaturedProducts = React.memo(FeaturedProductsComponent);