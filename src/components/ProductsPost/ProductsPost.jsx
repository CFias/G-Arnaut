import React, { useEffect, useState } from "react";
import { db } from "../../services/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./styles.css";

export const ProductsPost = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Erro ao buscar produtos: ", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      {products.length > 0 ? (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              {product.images && product.images.length > 0 && (
                <div className="product-images">
                  {product.images.map((img, index) => (
                    <img
                      className="product-img"
                      key={index}
                      src={img}
                      alt={`Product image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              <div className="product-infos">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <p className="product-price">R$ {product.price}</p>
                {product.author && (
                  <p className="product-author">
                    {product.author.userName || "Gildavi Arnaut"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Carregando produtos...</p>
      )}
    </>
  );
};
