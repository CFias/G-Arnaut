import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/FirebaseConfig";
import { collection, query, where, getDocs, limit, startAfter } from "firebase/firestore";
import {
  Category,
  CropFree,
  DirectionsCar,
  FavoriteBorder,
  Hotel,
} from "@mui/icons-material";
import "./styles.css";
import { Navbar } from "../../components/Navbar/Navbar";

const PRODUCTS_PER_PAGE = 12;

export const RentProducts = () => {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async (cursor = null) => {
    setIsLoading(true);
    try {
      // Query filtrada + paginada no próprio Firestore, em vez de baixar
      // TODA a coleção e filtrar no navegador. As imagens já vêm como
      // URLs prontas salvas no documento (AddProducts já grava a URL
      // final do Storage) — não é necessário nenhuma chamada extra a
      // getDownloadURL aqui, o que eliminava o maior gargalo de
      // performance da página.
      const constraints = [
        collection(db, "products"),
        where("productType", "==", "aluguel"),
        limit(PRODUCTS_PER_PAGE),
      ];
      if (cursor) constraints.splice(2, 0, startAfter(cursor));

      const q = query(...constraints);
      const querySnapshot = await getDocs(q);

      const newProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts((prev) => (cursor ? [...prev, ...newProducts] : newProducts));
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Erro ao buscar produtos para aluguel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCardClick = (id) => navigate(`/product/${id}`);
  const loadMore = () => fetchProducts(lastDoc);

  return (
    <>
      <Navbar />
      <div className="filter-product-container">
        <h1>Imóveis disponíveis para Aluguel</h1>
        <div className="product-list-filter">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleCardClick(product.id)}
            >
              {product.images && product.images.length > 0 && (
                <div className="product-images">
                  <img
                    className="product-img"
                    src={product.images[0]}
                    alt={`${product.category} em ${product.neighborhood || product.city}`}
                    loading="lazy"
                    width={280}
                    height={180}
                  />
                </div>
              )}
              <div className="product-infos">
                <h3 className="product-address">
                  {product.city} <FavoriteBorder />
                </h3>
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
                  <h3 className="product-type">{product.productType}</h3>
                </div>
              </div>
            </div>
          ))}

          {isLoading && <p>Carregando imóveis...</p>}
          {!isLoading && products.length === 0 && (
            <p>Nenhum imóvel disponível para aluguel no momento.</p>
          )}
          {!isLoading && hasMore && products.length > 0 && (
            <button className="load-more-button" onClick={loadMore}>
              Ver mais
            </button>
          )}
        </div>
      </div>
    </>
  );
};
