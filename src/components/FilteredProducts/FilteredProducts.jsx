import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../Navbar/Navbar";
import { Category, CropFree, DirectionsCar, Hotel } from "@mui/icons-material";
import "./styles.css";

export const FilteredProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (location.state && location.state.filteredProducts) {
      setFilteredProducts(location.state.filteredProducts);
    }
  }, [location.state]);

  const handleClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="filtered-products-container">
        <h2>Imóveis filtrados</h2>
        <div className="filtered-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="filtered-card"
                onClick={() => handleClick(product.id)}
                style={{ cursor: "pointer" }}
              >
                {product.images && product.images.length > 0 && (
                  <div className="filtered-images">
                    <p className="filtered-status">{product.status}</p>
                    <img
                      className="filtered-img"
                      src={product.images[0]}
                      alt={product.address}
                    />
                  </div>
                )}
                <div className="filtered-infos">
                  <h3 className="filtered-address">{product.city}</h3>
                  <p className="filtered-neighborhood">
                    {product.neighborhood}
                  </p>
                  <div className="filtered-details">
                    <div className="filtered-dimension">
                      <Category className="filtered-icon" fontSize="small" />{" "}
                      <p className="filtered-category">{product.category}</p>
                    </div>
                    <div className="filtered-dimension">
                      <CropFree className="filtered-icon" fontSize="small" />
                      <p className="filtered-size">{product.dimension} m²</p>
                    </div>
                    <div className="filtered-dimension">
                      <Hotel className="filtered-icon" fontSize="small" />
                      <p className="filtered-size">{product.bedrooms}</p>
                    </div>
                    <div className="filtered-dimension">
                      <DirectionsCar
                        className="filtered-icon"
                        fontSize="small"
                      />
                      <p className="filtered-size">{product.parkingSpaces}</p>
                    </div>
                  </div>
                  <div className="filtered-price-mod">
                    <div className="filtered-oldPrice">
                      <s>R$ {product.oldPrice}</s>
                      <p className="filtered-price">R$ {product.price}</p>
                    </div>
                    <h3 className="filtered-type">{product.productType}</h3>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products-message">
              <p>
                Nenhum imóvel encontrado com os filtros selecionados. Por favor,
                ajuste os critérios e tente novamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
