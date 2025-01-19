import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Category,
  CropFree,
  DirectionsCar,
  East,
  Hotel,
  Verified,
} from "@mui/icons-material";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./styles.css";
import Profile from "../../assets/image/arnaut-profile.jpg";

export const FeaturedProducts = ({ product }) => {
  const [isLoading, setIsLoading] = useState(true); // Estado para simular carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Simula o carregamento por 2 segundos
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (id) => {
    navigate(`/product/${id}`);
  };

  if (isLoading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <div className="product-card">
          <div className="product-images">
            <Skeleton height={150} width="100%" />
          </div>
          <div className="product-infos">
            <div className="first-item">
              <Skeleton circle={true} height={40} width={40} />
              <div className="infos-profile">
                <Skeleton height={10} width="50%" />
                <Skeleton height={10} width="30%" />
              </div>
            </div>
            <Skeleton height={20} width="70%" />
            <Skeleton height={15} width="60%" />
            <Skeleton height={15} width="90%" />
            <div className="infos-details">
              <Skeleton height={10} width="30%" />
              <Skeleton height={10} width="30%" />
              <Skeleton height={10} width="30%" />
            </div>
            <div className="product-price-mod">
              <Skeleton height={20} width="40%" />
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!product) return null; // Evita erro se o produto não estiver disponível

  return (
    <div className="product-card" onClick={() => handleCardClick(product.id)}>
      {product.images && product.images.length > 0 && (
        <div className="product-images">
          <p className="product-status">{product.status}</p>
          <p className="product-ref">Ref: {product.refProduct}</p>
          <img className="product-img" src={product.images[0]} alt="Product" />
        </div>
      )}
      <div className="product-infos">
        <div className="first-item">
          <img className="product-profile" src={Profile} alt="Perfil" />
          <div className="infos-profile">
            <p>Gildavi Arnaut</p>
            <Verified className="icon-profile" fontSize="10" />
          </div>
        </div>
        <div className="product-type">
          {" "}
          <p className="product-category">{product.category}</p>À
          <p className="product-category"> {product.productType}</p>
        </div>

        <h3 className="product-city">{product.city}</h3>
        <p className="product-neighborhood">{product.neighborhood}</p>
        <p className="product-address">{product.address}</p>
        <div className="infos-details">
          <div className="product-dimension">
            <CropFree className="product-icon" fontSize="small" />
            <p className="product-size">{product.dimension} m²</p>
          </div>
          <div className="product-dimension">
            <Hotel className="product-icon" fontSize="small" />
            <p className="product-size">{product.bedrooms}</p>
          </div>
          <div className="product-dimension">
            <DirectionsCar className="product-icon" fontSize="small" />
            <p className="product-size">{product.parkingSpaces}</p>
          </div>
        </div>
        <div className="product-price-mod">
          <p className="product-price">R$ {product.price}</p>
          <East fontSize="small" />
        </div>
      </div>
    </div>
  );
};
