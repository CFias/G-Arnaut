import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Category,
  CropFree,
  DirectionsCar,
  Hotel,
  Verified,
} from "@mui/icons-material";
import "./styles.css";
import Profile from "../../assets/image/arnaut-profile.jpg";

export const FeaturedProducts = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/product/${id}`);
  };

  if (!product) return null; // Evita erro se o produto não estiver disponível

  return (
    <div className="product-container">
      <div className="product-card" onClick={() => handleCardClick(product.id)}>
        {product.images && product.images.length > 0 && (
          <div className="product-images">
            <p className="product-status">{product.status}</p>
            <p className="product-ref">Referência: {product.refProduct}</p>
            <img
              className="product-img"
              src={product.images[0]}
              alt="Product"
            />
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
          <h3 className="product-city">{product.city}</h3>
          <p className="product-neighborhood">{product.neighborhood}</p>
          <p className="product-address">{product.address}</p>
          <div className="infos-details">
            <p className="product-category">
              <Category className="product-icon" fontSize="small" />{" "}
              {product.category}
            </p>
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
            <h3 className="product-type">{product.productType}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};
