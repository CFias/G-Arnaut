import React, { useEffect, useState } from "react";
import { db, storage } from "../../services/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import {
  Category,
  CropFree,
  DirectionsCar,
  FavoriteBorder,
  Hotel,
} from "@mui/icons-material";
import "./styles.css";
import { Navbar } from "../../components/Navbar/Navbar";

export const RentProducts = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Função para buscar os produtos do Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrando os produtos do tipo 'aluguel'
      const rentProducts = productList.filter(
        (product) => product.productType === "aluguel"
      );

      // Função para obter URLs das imagens do produto
      const productsWithImages = await Promise.all(
        rentProducts.map(async (product) => {
          if (product.images && product.images.length > 0) {
            const imageUrls = await Promise.all(
              product.images.map(async (imagePath) => {
                try {
                  const imageRef = ref(storage, imagePath);
                  const downloadURL = await getDownloadURL(imageRef);
                  return downloadURL;
                } catch (error) {
                  console.error("Erro ao obter URL da imagem:", error);
                  return null;
                }
              })
            );
            return { ...product, images: imageUrls.filter(Boolean) };
          }
          return product;
        })
      );

      // Evita atualizar o estado com os mesmos produtos
      setProducts((prevProducts) => {
        const newProducts = productsWithImages.filter(
          (product) => !prevProducts.some((p) => p.id === product.id)
        );
        return [...prevProducts, ...newProducts];
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // O array vazio faz com que o efeito só seja executado uma vez, no mount

  // Paginação dos produtos
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <>
      <Navbar />
      <div className="filter-product-container">
        <h1>Imóveis disponíveis para Aluguel </h1>
        <div className="product-list">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.images && product.images.length > 0 && (
                <div className="product-images">
                  <img
                    className="product-img"
                    src={product.images[0]}
                    alt="Product"
                  />
                </div>
              )}
              <div className="product-infos">
                <h3 className="product-address">
                  {product.city} <FavoriteBorder />{" "}
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
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <span
                  key={index}
                  className={`dot ${currentPage === index + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
