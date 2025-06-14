import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../services/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import SearchIcon from "@mui/icons-material/Search";
import {
  MenuItem,
  Select,
  Breadcrumbs,
  Typography,
  InputLabel,
  FormControl,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Category, CropFree, DirectionsCar, Hotel } from "@mui/icons-material";
import "./styles.css";
import { Navbar } from "../../components/Navbar/Navbar";

export const SaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [cityCounts, setCityCounts] = useState({});
  const [dimensionCounts, setDimensionCounts] = useState({});
  const [parkingCounts, setParkingCounts] = useState({});
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [sortOrder, setSortOrder] = useState("");
  const [totalProperties, setTotalProperties] = useState(0);
  const [showCategories, setShowCategories] = useState(true);

  const [selectedProductType, setSelectedProductType] = useState("venda");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [selectedBedrooms, setSelectedBedrooms] = useState("");
  const [selectedParking, setSelectedParking] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let filtered = productList.filter(
        (p) => p.productType === selectedProductType
      );

      if (selectedCategory)
        filtered = filtered.filter((p) => p.category === selectedCategory);

      if (selectedStatus)
        filtered = filtered.filter((p) => p.status === selectedStatus);

      if (selectedCity)
        filtered = filtered.filter((p) => p.city === selectedCity);

      if (selectedNeighborhood)
        filtered = filtered.filter(
          (p) => p.neighborhood === selectedNeighborhood
        );

      if (selectedBedrooms)
        filtered = filtered.filter(
          (p) => Number(p.bedrooms) === Number(selectedBedrooms)
        );

      if (selectedParking)
        filtered = filtered.filter(
          (p) => Number(p.parkingSpaces) === Number(selectedParking)
        );

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.city?.toLowerCase().includes(lowerSearch) ||
            p.neighborhood?.toLowerCase().includes(lowerSearch) ||
            p.reference?.toLowerCase().includes(lowerSearch)
        );
      }

      const distinctCategories = [...new Set(filtered.map((p) => p.category))];

      const counts = distinctCategories.reduce((acc, category) => {
        acc[category] = filtered.filter((p) => p.category === category).length;
        return acc;
      }, {});

      const statusData = filtered.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});

      const cityData = filtered.reduce((acc, p) => {
        acc[p.city] = (acc[p.city] || 0) + 1;
        return acc;
      }, {});

      const dimensionData = filtered.reduce((acc, p) => {
        const dim = p.dimension;
        if (dim >= 20 && dim <= 500) {
          const range = Math.floor(dim / 100) * 100;
          acc[range] = (acc[range] || 0) + 1;
        }
        return acc;
      }, {});

      const parkingData = filtered.reduce((acc, p) => {
        acc[p.parkingSpaces] = (acc[p.parkingSpaces] || 0) + 1;
        return acc;
      }, {});

      setCategories(distinctCategories);
      setCategoryCounts(counts);
      setProducts(filtered);
      setTotalProperties(filtered.length);
      setStatusCounts(statusData);
      setCityCounts(cityData);
      setDimensionCounts(dimensionData);
      setParkingCounts(parkingData);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    selectedProductType,
    selectedCategory,
    selectedStatus,
    selectedCity,
    selectedNeighborhood,
    selectedBedrooms,
    selectedParking,
    searchTerm,
  ]);

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortOrder(value);
    let sortedProducts = [...products];
    if (value === "low-to-high") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (value === "high-to-low") {
      sortedProducts.sort((a, b) => b.price - a.price);
    }
    setProducts(sortedProducts);
  };

  const handleCardClick = (id) => {
    navigate(`/product/${id}`);
  };

  const loadMore = () => setVisibleProducts((prev) => prev + 12);

  return (
    <>
      <Navbar />
      <div className="filter-product-container">
        <div className="breadcrumb-container">
          <Breadcrumbs aria-label="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Início
            </Link>
            <Typography sx={{ color: "gray", fontSize: "12px" }}>
              Imóveis para Venda
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="filter-product-content-sale">
          <div className="filter-side-sale">
            <h2 className="filter-title-sale">Filtrar Imóveis</h2>

            {/* Toggle Venda/Aluguel */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <label className="toggle-label">Imóveis para:</label>
              <div className="toggle-button-group">
                <button
                  className={`toggle-button ${
                    selectedProductType === "venda" ? "active" : ""
                  }`}
                  onClick={() => setSelectedProductType("venda")}
                >
                  Venda
                </button>
                <button
                  className={`toggle-button ${
                    selectedProductType === "aluguel" ? "active" : ""
                  }`}
                  onClick={() => setSelectedProductType("aluguel")}
                >
                  Aluguel
                </button>
              </div>
            </FormControl>

            <FormControl className="" fullWidth sx={{ mb: 2 }}>
              <TextField
                label="Buscar por bairro, cidade ou referência"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#999", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                className="floating-label-search"
              />
            </FormControl>

            {/* Demais filtros */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                value={selectedCategory}
                label="Categoria"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Casa">Casa</MenuItem>
                <MenuItem value="Apartamento">Apartamento</MenuItem>
                <MenuItem value="Terreno">Terreno</MenuItem>
                <MenuItem value="Comercial">Comercial</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="status-label">Status da Obra</InputLabel>
              <Select
                labelId="status-label"
                value={selectedStatus}
                label="Status da Obra"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Pronto">Pronto</MenuItem>
                <MenuItem value="Em Obra">Em Obra</MenuItem>
                <MenuItem value="Lançamento">Lançamento</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="city-label">Cidade</InputLabel>
              <Select
                labelId="city-label"
                value={selectedCity}
                label="Cidade"
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {Object.keys(cityCounts).map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="neighborhood-label">Bairro</InputLabel>
              <Select
                labelId="neighborhood-label"
                value={selectedNeighborhood}
                label="Bairro"
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {[...new Set(products.map((p) => p.neighborhood))].map(
                  (bairro) => (
                    <MenuItem key={bairro} value={bairro}>
                      {bairro}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="bedrooms-label">Quartos</InputLabel>
              <Select
                labelId="bedrooms-label"
                value={selectedBedrooms}
                label="Quartos"
                onChange={(e) => setSelectedBedrooms(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="parking-label">
                Vagas de Estacionamento
              </InputLabel>
              <Select
                labelId="parking-label"
                value={selectedParking}
                label="Vagas de Estacionamento"
                onChange={(e) => setSelectedParking(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {[0, 1, 2, 3, 4].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="product-list-filter">
            <div className="list-product-two">
              <div className="toggle-categories-button">
                <p className="total-properties">{totalProperties} Resultados</p>
                <ul className="category-list">
                  {categories.map((category) => (
                    <li key={category} className="category-item">
                      {category}{" "}
                      <span className="category-count">
                        ({categoryCounts[category]})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="form-control">
                <label htmlFor="ordenar">Ordenar por</label>
                <select
                  id="ordenar"
                  value={sortOrder}
                  onChange={handleSortChange}
                >
                  <option value="">Padrão</option>
                  <option value="low-to-high">Menor Preço</option>
                  <option value="high-to-low">Maior Preço</option>
                </select>
              </div>
            </div>

            {products.slice(0, visibleProducts).map((product) => (
              <div
                key={product.id}
                className="product-card-sale"
                onClick={() => handleCardClick(product.id)}
              >
                {product.images && product.images.length > 0 && (
                  <div className="product-images-sale">
                    <img
                      className="product-img-sale"
                      src={product.images[0]}
                      alt="Product"
                    />
                  </div>
                )}
                <div className="product-infos-sale">
                  <h3 className="product-city-sale">{product.city}</h3>
                  <p className="product-address-sale">{product.address}</p>
                  <p className="product-neighborhood-sale">
                    {product.neighborhood}
                  </p>
                  <div className="infos-details-sale">
                    <p className="product-category-sale">
                      <Category
                        className="product-icon-sale"
                        fontSize="small"
                      />{" "}
                      {product.category}
                    </p>
                    <div className="product-dimension-sale">
                      <CropFree
                        className="product-icon-sale"
                        fontSize="small"
                      />
                      <p className="product-size-sale">
                        {product.dimension} m²
                      </p>
                    </div>
                    <div className="product-dimension-sale">
                      <Hotel className="product-icon-sale" fontSize="small" />
                      <p className="product-size-sale">{product.bedrooms}</p>
                    </div>
                    <div className="product-dimension-sale">
                      <DirectionsCar
                        className="product-icon-sale"
                        fontSize="small"
                      />
                      <p className="product-size-sale">
                        {product.parkingSpaces}
                      </p>
                    </div>
                  </div>
                  <div className="product-price-mod-sale">
                    <h3 className="product-price-sale">R$ {product.price}</h3>
                    <h3 className="product-type-sale">{product.productType}</h3>
                  </div>
                </div>
              </div>
            ))}

            {visibleProducts < products.length && (
              <div className="load-more-container">
                <button onClick={loadMore} className="load-more-button">
                  Ver mais
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
