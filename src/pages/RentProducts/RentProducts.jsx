import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa o hook useNavigate para navegação
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
  const [products, setProducts] = useState([]); // Estado para armazenar os produtos
  const [currentPage, setCurrentPage] = useState(1); // Estado para controlar a página atual
  const productsPerPage = 12; // Número de produtos por página
  const navigate = useNavigate(); // Hook para navegação

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

  // Função executada ao montar o componente para buscar os produtos
  useEffect(() => {
    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / productsPerPage); // Calcula o total de páginas
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  ); // Produtos a serem exibidos na página atual

  // Função para redirecionar ao clicar no card do produto
  const handleCardClick = (id) => {
    navigate(`/product/${id}`); // Redireciona para a rota específica do produto
  };

  return (
    <>
      <Navbar />
      <div className="filter-product-container">
        <h1>Imóveis disponíveis para Aluguel</h1>
        <div className="product-list-filter">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleCardClick(product.id)} // Evento de clique no card
            >
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
