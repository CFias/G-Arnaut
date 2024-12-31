import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../Navbar/Navbar";
import { Category, CropFree, DirectionsCar, Hotel } from "@mui/icons-material";
import "./styles.css";

export const FilteredProducts = () => {
  const location = useLocation();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (location.state && location.state.filteredProducts) {
      console.log(
        "Produtos recebidos no componente:",
        location.state.filteredProducts
      );
      setFilteredProducts(location.state.filteredProducts);
    }
  }, [location.state]);

  return (
    <>
      <Navbar />
      <div className="filtered-products-container">
        <h2>Imóveis filtrados</h2>
        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                {product.images && product.images.length > 0 && (
                  <div className="product-images">
                    <p className="product-status">{product.status}</p>
                    <p className="product-ref">
                      Referência: {product.refProduct}
                    </p>
                    <img
                      className="product-img"
                      src={product.images[0]}
                      alt={product.address}
                    />
                  </div>
                )}
                <div className="product-infos">
                  <h3 className="product-address">{product.city}</h3>
                  <p className="product-neighborhood">{product.neighborhood}</p>
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
                      <DirectionsCar
                        className="product-icon"
                        fontSize="small"
                      />
                      <p className="product-size">{product.parkingSpaces}</p>
                    </div>
                  </div>
                  <div className="product-price-mod">
                    <div className="product-oldPrice">
                      <s>R$ {product.oldPrice}</s>
                      <p className="product-price">R$ {product.price}</p>
                    </div>
                    <h3 className="product-type">{product.productType}</h3>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum imóvel encontrado.</p>
          )}
        </div>
      </div>
    </>
  );
};
