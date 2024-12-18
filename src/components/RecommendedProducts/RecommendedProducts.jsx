import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import "./styles.css"; // Estilos atualizados

export const RecommendedProducts = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        console.log(products); // Verificando se os produtos estão sendo buscados corretamente
        setRecommendedProducts(products);
      } catch (error) {
        console.error("Erro ao buscar produtos recomendados:", error);
      }
    };

    fetchRecommendedProducts();
  }, []);

  return (
    <div className="recommended-products-container">
      <h2>Produtos Recomendados</h2>
      <div className="recommended-products">
        {recommendedProducts.map((product) => (
          <div className="recommended-product-card" key={product.id}>
            <Link to={`/product-details/${product.id}`}>
              <img
                src={product.images[0]}
                alt={product.name}
                className="recommended-product-image"
              />
              <p className="recommended-product-name">{product.name}</p>
              <p className="recommended-product-price">
                R$ {product.price.split(".")[0]}
                <span className="recommended-product-price-decimal">
                  .{product.price.split(".")[1]}
                </span>
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
