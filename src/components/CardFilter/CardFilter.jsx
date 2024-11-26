import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig"; // Importando o Firebase
import "./styles.css";

export const CardFilter = () => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const navigate = useNavigate();

  const handleFilter = async (e) => {
    e.preventDefault();

    // Criando a consulta com filtros
    const productsRef = collection(db, "products");

    // Inicializando a consulta
    let q = query(productsRef);
    // Filtros adicionais
    if (price) {
      q = query(q, where("price", "==", price));
    }
    if (category) {
      q = query(q, where("category", "==", category));
    }
    if (city) {
      q = query(q, where("city", "==", city));
    }
    if (neighborhood) {
      q = query(q, where("neighborhood", "==", neighborhood));
    }
    if (reference) {
      q = query(q, where("refProduct", "==", reference)); // Adicionando filtro para referência
    }

    // Buscando os dados filtrados
    try {
      const querySnapshot = await getDocs(q);
      const filteredProducts = querySnapshot.docs.map((doc) => doc.data());

      // Passando os produtos filtrados para a próxima página via navigate
      navigate("/filtered-products", {
        state: {
          filteredProducts, // Passando os produtos filtrados
        },
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Erro ao buscar produtos.");
    }
  };

  return (
    <div className="filter-container">
      <div className="filter-top">
        <h2 className="filter-h2">Encontre o imóvel ideal</h2>
      </div>
      <form className="filter-content" onSubmit={handleFilter}>
        <div className="filter-item">
          <h3 className="filter-h3">Faixa de preço</h3>
          <input
            className="filter-in"
            placeholder="R$ 0.00"
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <h3 className="filter-h3">Cidade</h3>
          <input
            className="filter-in"
            placeholder="Qual cidade você deseja ?"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <h3 className="filter-h3">Bairro</h3>
          <input
            className="filter-in"
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <h3 className="filter-h3">Padrão</h3>
          <input
            className="filter-in"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <h3 className="filter-h3">Referência</h3>
          <input
            className="filter-in"
            type="number"
            placeholder="Buscar por referência"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <button type="submit" className="filter-submit-button">
          Pesquisar
        </button>
      </form>
    </div>
  );
};
