import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import "./styles.css";
import { East, Search } from "@mui/icons-material";
import { InputAdornment, MenuItem, TextField } from "@mui/material";

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

  const handleFilter = (e) => {
    e.preventDefault();

    const filterCriteria = {
      city,
      price,
      reference,
      category,
      neighborhood,
      bedrooms,
    };

    navigate("/sale-products", {
      state: { filterCriteria },
    });
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
            <TextField
              label="Cidade"
              placeholder="Ex: Salvador"
              variant="outlined"
              fullWidth
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="filter-in"
            />
          </div>

          <div className="filter-item">
            <TextField
              label="Bairro"
              placeholder="Ex: Imbuí"
              variant="outlined"
              fullWidth
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="filter-in"
            />
          </div>

          <div className="filter-item">
            <TextField
              label="Categoria"
              select
              variant="outlined"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-in"
              required
            >
              <MenuItem value="">Selecione uma Categoria</MenuItem>
              <MenuItem value="Apartamento">Apartamento</MenuItem>
              <MenuItem value="Casa">Casa</MenuItem>
              <MenuItem value="Fazenda">Fazenda</MenuItem>
              <MenuItem value="Sítio">Sítio</MenuItem>
              <MenuItem value="Terreno">Terreno</MenuItem>
            </TextField>
          </div>

          <div className="filter-item">
            <TextField
              label="Referência"
              placeholder="Ex: 12345"
              variant="outlined"
              fullWidth
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="filter-in"
            />
          </div>

          <div className="filter-item">
            <TextField
              label="Preço Máximo"
              placeholder="R$ 350.000"
              variant="outlined"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="filter-in"
            />
          </div>

          <div className="filter-item">
            <TextField
              label="Quartos"
              placeholder="Ex: 4"
              variant="outlined"
              type="number"
              fullWidth
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="filter-in"
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
