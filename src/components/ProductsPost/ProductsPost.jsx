import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export const ProductsPost = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const productsPerPage = 12;
  const navigate = useNavigate();

  // Função para buscar os produtos do Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Função para obter URLs das imagens do produto
      const productsWithImages = await Promise.all(
        productList.map(async (product) => {
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

      // Atualiza o estado com os produtos carregados
      setProducts(productsWithImages);
      setFilteredProducts(productsWithImages); // Inicialmente, todos os produtos são filtrados
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  // Chama a função para buscar os produtos quando o componente for montado
  useEffect(() => {
    fetchProducts();
  }, []); // O array vazio faz com que o efeito só seja executado uma vez, no mount

  const applyFilters = () => {
    let filtered = [...products];

    if (categoryFilter) {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (minPrice) {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(maxPrice)
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Resetar para a primeira página após aplicar o filtro
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Paginação dos produtos
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleCardClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="product-list">
      <div className="filters">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Selecione a Categoria</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Casa">Casa</option>
          <option value="Comercial">Comercial</option>
        </select>

        <input
          type="number"
          placeholder="Preço Mínimo"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Preço Máximo"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <button onClick={applyFilters}>Aplicar Filtros</button>
      </div>
      {paginatedProducts.map((product) => (
        <div
          key={product.id}
          className="product-card"
          onClick={() => handleCardClick(product.id)}
        >
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

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="pagination-dots">
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
  );
};
