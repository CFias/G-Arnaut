import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../Navbar/Navbar";
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
        <h2>Produtos Filtrados</h2>
        <div className="product-results">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div key={index} className="product-card">
                <h3>{product.address}</h3>
                <p>Preço: R$ {product.price}</p>
                <p>Estado: {product.state}</p>
                <p>Referência: {product.refProduct}</p>
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.address}
                    className="product-image"
                  />
                )}
              </div>
            ))
          ) : (
            <p>Nenhum produto encontrado.</p>
          )}
        </div>
      </div>
    </>
  );
};
