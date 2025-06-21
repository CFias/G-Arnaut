import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./styles.css";
import { East } from "@mui/icons-material";
import Logo from "../../assets/image/garnaut-gray-logo.png";

export const CardFilter = () => {
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleFilter = async (e) => {
    e.preventDefault();

    const productsRef = collection(db, "products");

    try {
      let q = query(productsRef);

      if (category) {
        q = query(q, where("category", "==", category));
      }
      if (bedrooms) {
        q = query(q, where("bedrooms", "==", bedrooms));
      }
      if (price) {
        q = query(q, where("price", "<=", parseFloat(price)));
      }

      const querySnapshot = await getDocs(q);
      let filteredProducts = querySnapshot.docs.map((doc) => doc.data());

      if (city) {
        filteredProducts = filteredProducts.filter((item) =>
          item.city?.toLowerCase().includes(city.toLowerCase())
        );
      }

      if (neighborhood) {
        filteredProducts = filteredProducts.filter((item) =>
          item.neighborhood?.toLowerCase().includes(neighborhood.toLowerCase())
        );
      }

      if (reference) {
        filteredProducts = filteredProducts.filter((item) =>
          item.refProduct?.toLowerCase().includes(reference.toLowerCase())
        );
      }

      console.log("Produtos filtrados encontrados:", filteredProducts);

      navigate("/filtered-products", {
        state: { filteredProducts },
      });
    } catch (error) {
      alert("Erro ao buscar produtos.");
    }
  };

  return (
    <div className="filter-container">
      <div className="filter-header">
        <h3 className="filter-title">Encontre o Imóvel Ideal</h3>
        <p className="filter-description">
          Use os filtros abaixo para encontrar imóveis que atendam às suas
          necessidades
        </p>
      </div>
      <div className="filter-card">
        <form className="filter-content" onSubmit={handleFilter}>
          <div className="filter-item">
            <label htmlFor="city" className="filter-label">
              Cidade
            </label>
            <input
              id="city"
              className="filter-in"
              placeholder="Ex: Salvador"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label htmlFor="neighborhood" className="filter-label">
              Bairro
            </label>
            <input
              id="neighborhood"
              className="filter-in"
              placeholder="Ex: Imbuí"
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">Categoria</label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-in"
              required
            >
              <option value="">Selecione uma Categoria</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Fazenda">Fazenda</option>
              <option value="Sítio">Sítio</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="reference" className="filter-label">
              Referência
            </label>
            <input
              id="reference"
              className="filter-in"
              type="text"
              placeholder="Ex: 12345"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label htmlFor="price" className="filter-label">
              Preço Máximo
            </label>
            <input
              id="price"
              className="filter-in"
              type="number"
              placeholder="R$ 350.000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label htmlFor="bedrooms" className="filter-label">
              Quartos
            </label>
            <input
              id="bedrooms"
              className="filter-in"
              type="number"
              placeholder="Ex: 4"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
          </div>
        </form>
        <div className="filter-btn">
          <button
            type="button"
            className="filter-submit-button"
            onClick={handleFilter}
          >
            Buscar Imóveis <East fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
};
