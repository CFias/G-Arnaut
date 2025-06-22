import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { db } from "../../services/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import SearchIcon from "@mui/icons-material/Search";
import {
  MenuItem,
  Breadcrumbs,
  Typography,
  FormControl,
  TextField,
  InputAdornment,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Category,
  CropFree,
  DirectionsCar,
  Hotel,
  InfoOutlined,
} from "@mui/icons-material";
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

  // Estados adaptados para arrays, para seleção múltipla
  const [selectedProductType, setSelectedProductType] = useState("venda");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState([]);
  const [selectedParking, setSelectedParking] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se vieram filtros da tela anterior, aplique
    if (location.state?.filterCriteria) {
      const { category, city, neighborhood, reference, price, bedrooms } =
        location.state.filterCriteria;

      if (category) setSelectedCategories([category]);
      if (city) setSelectedCities([city]);
      if (neighborhood) setSelectedNeighborhoods([neighborhood]);
      if (bedrooms) setSelectedBedrooms([bedrooms]);
      if (price) setSortOrder("low-to-high"); // exemplo: aplicar ordenação se quiser
      if (reference) setSearchTerm(reference);
    }
  }, [location.state]);

  // Função genérica para alterar arrays de seleção múltipla
  const handleCheckboxChange = (setter, selectedArray, value) => (e) => {
    const checked = e.target.checked;
    if (checked) {
      setter([...selectedArray, value]);
    } else {
      setter(selectedArray.filter((item) => item !== value));
    }
  };

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);
      let productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtragem ajustada para múltiplas seleções
      let filtered = productList.filter(
        (p) => p.productType === selectedProductType
      );

      if (selectedCategories.length > 0)
        filtered = filtered.filter((p) =>
          selectedCategories.includes(p.category)
        );

      if (selectedStatuses.length > 0)
        filtered = filtered.filter((p) => selectedStatuses.includes(p.status));

      if (selectedCities.length > 0)
        filtered = filtered.filter((p) => selectedCities.includes(p.city));

      if (selectedNeighborhoods.length > 0)
        filtered = filtered.filter((p) =>
          selectedNeighborhoods.includes(p.neighborhood)
        );

      if (selectedBedrooms.length > 0)
        filtered = filtered.filter((p) =>
          selectedBedrooms.includes(Number(p.bedrooms))
        );

      if (selectedParking.length > 0)
        filtered = filtered.filter((p) =>
          selectedParking.includes(Number(p.parkingSpaces))
        );

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.city?.toLowerCase().includes(lowerSearch) ||
            p.neighborhood?.toLowerCase().includes(lowerSearch) ||
            p.refProduct?.toLowerCase().includes(lowerSearch)
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
    selectedCategories,
    selectedStatuses,
    selectedCities,
    selectedNeighborhoods,
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

  // Opções para os checkboxes
  const categoryOptions = ["Casa", "Apartamento", "Terreno", "Comercial"];
  const statusOptions = ["Pronto", "Em Obra", "Lançamento"];
  const bedroomOptions = [1, 2, 3, 4, 5];
  const parkingOptions = [0, 1, 2, 3, 4];
  const cityOptions = Object.keys(cityCounts || {});
  const neighborhoodOptions = [...new Set(products.map((p) => p.neighborhood))];

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
        <div className="filter-product-content">
          <div className="filter-side-sale">
            <h2 className="filter-title-sale">Filtrar Imóveis</h2>
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

            <FormControl fullWidth sx={{ mb: 2 }}>
              <TextField
                label="Buscar por bairro, cidade ou referência"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                className="filter-in-search"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#999", fontSize: 14 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            {/* Categoria - checkbox */}
            <FormControl
              component="fieldset"
              fullWidth
              sx={{ mb: 2 }}
              className="filter-group"
            >
              <FormLabel
                className="filter-name-top"
                component="legend"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span className="filter-content-sale">
                  Categoria
                  <Tooltip title="Selecione o tipo de imóvel que deseja" arrow>
                    <InfoOutlined
                      className="info-icon"
                      sx={{ fontSize: 16, cursor: "help", color: "#666" }}
                    />
                  </Tooltip>
                </span>
              </FormLabel>
              <FormGroup className="filter-checkbox-group">
                {categoryOptions.map((category) => (
                  <FormControlLabel
                    className="filter-checkbox-label"
                    key={category}
                    control={
                      <Checkbox
                        className="filter-checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={handleCheckboxChange(
                          setSelectedCategories,
                          selectedCategories,
                          category
                        )}
                        name={category}
                      />
                    }
                    label={category}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <FormControl
              component="fieldset"
              fullWidth
              sx={{ mb: 2 }}
              className="filter-group"
            >
              <FormLabel
                className="filter-name-top"
                component="legend"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span className="filter-content-sale">
                  Status da Obra
                  <Tooltip title="Informe o status da obra" arrow>
                    <InfoOutlined
                      className="info-icon"
                      sx={{ fontSize: 16, cursor: "help", color: "#666" }}
                    />
                  </Tooltip>
                </span>
              </FormLabel>
              <FormGroup className="filter-checkbox-group">
                {statusOptions.map((status) => (
                  <FormControlLabel
                    className="filter-checkbox-label"
                    key={status}
                    control={
                      <Checkbox
                        className="filter-checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={handleCheckboxChange(
                          setSelectedStatuses,
                          selectedStatuses,
                          status
                        )}
                        name={status}
                      />
                    }
                    label={status}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <FormControl
              component="fieldset"
              fullWidth
              sx={{ mb: 2 }}
              className="filter-group"
            >
              <FormLabel
                className="filter-name-top"
                component="legend"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span className="filter-content-sale">
                  Cidade
                  <Tooltip title="Selecione a cidade desejada" arrow>
                    <InfoOutlined
                      className="info-icon"
                      sx={{ fontSize: 16, cursor: "help", color: "#666" }}
                    />
                  </Tooltip>
                </span>
              </FormLabel>
              <FormGroup className="filter-checkbox-group">
                {cityOptions.map((city) => (
                  <FormControlLabel
                    className="filter-checkbox-label"
                    key={city}
                    control={
                      <Checkbox
                        className="filter-checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={handleCheckboxChange(
                          setSelectedCities,
                          selectedCities,
                          city
                        )}
                        name={city}
                      />
                    }
                    label={city}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <FormControl
              component="fieldset"
              fullWidth
              sx={{ mb: 2 }}
              className="filter-group"
            >
              <FormLabel
                className="filter-name-top"
                component="legend"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span className="filter-content-sale">
                  Bairro
                  <Tooltip title="Selecione o bairro desejado" arrow>
                    <InfoOutlined
                      className="info-icon"
                      sx={{ fontSize: 16, cursor: "help", color: "#666" }}
                    />
                  </Tooltip>
                </span>
              </FormLabel>
              <FormGroup className="filter-checkbox-group">
                {neighborhoodOptions.map((bairro) => (
                  <FormControlLabel
                    className="filter-checkbox-label"
                    key={bairro}
                    control={
                      <Checkbox
                        className="filter-checkbox"
                        checked={selectedNeighborhoods.includes(bairro)}
                        onChange={handleCheckboxChange(
                          setSelectedNeighborhoods,
                          selectedNeighborhoods,
                          bairro
                        )}
                        name={bairro}
                      />
                    }
                    label={bairro}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <FormControl
              component="fieldset"
              fullWidth
              sx={{ mb: 2 }}
              className="filter-group"
            >
              <FormLabel className="filter-name-top" component="legend">
                <span className="filter-content-sale">
                  Quartos
                  <Tooltip title="Selecione a quantidade de quartos" arrow>
                    <InfoOutlined
                      className="info-icon"
                      sx={{ fontSize: 16, cursor: "help", color: "#666" }}
                    />
                  </Tooltip>
                </span>
              </FormLabel>
              <FormGroup row className="filter-checkbox-group">
                {bedroomOptions.map((num) => (
                  <FormControlLabel
                    className="filter-checkbox-label"
                    key={num}
                    control={
                      <Checkbox
                        className="filter-checkbox"
                        checked={selectedBedrooms.includes(num)}
                        onChange={handleCheckboxChange(
                          setSelectedBedrooms,
                          selectedBedrooms,
                          num
                        )}
                        name={`${num}`}
                      />
                    }
                    label={num}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <FormControl
              component="fieldset"
              fullWidth
              sx={{ mb: 2 }}
              className="filter-group"
            >
              <FormLabel
                className="filter-name-top"
                component="legend"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span className="filter-content-sale">
                  Vagas de Estacionamento
                  <Tooltip
                    title="Selecione a quantidade de vagas de estacionamento"
                    arrow
                  >
                    <InfoOutlined
                      className="info-icon"
                      sx={{ fontSize: 16, cursor: "help", color: "#666" }}
                    />
                  </Tooltip>
                </span>
              </FormLabel>
              <FormGroup row className="filter-checkbox-group">
                {parkingOptions.map((num) => (
                  <FormControlLabel
                    className="filter-checkbox-label"
                    key={num}
                    control={
                      <Checkbox
                        className="filter-checkbox"
                        checked={selectedParking.includes(num)}
                        onChange={handleCheckboxChange(
                          setSelectedParking,
                          selectedParking,
                          num
                        )}
                        name={`${num}`}
                      />
                    }
                    label={num}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedStatuses([]);
                setSelectedCities([]);
                setSelectedNeighborhoods([]);
                setSelectedBedrooms([]);
                setSelectedParking([]);
                setSearchTerm("");
                setSelectedProductType("venda");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
          <div className="filter-product-content-sale">
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
            <div className="product-list-filter">
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
                    <div className="infos-details-sale">
                      <h3 className="product-city-sale">{product.city}</h3>
                      <p className="product-neighborhood-sale">
                        {product.neighborhood}
                      </p>
                      <p className="product-address-sale">{product.address}</p>
                      <div className="infos-all-sale">
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
                          <Hotel
                            className="product-icon-sale"
                            fontSize="small"
                          />
                          <p className="product-size-sale">
                            {product.bedrooms}
                          </p>
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
                      <div className="end-card-sale">
                        <div className="product-price-mod-sale">
                          <div className="product-type-sale">
                            <p className="product-category-sale">
                              {product.category}
                            </p>
                            À
                            <p className="product-category-sale">
                              {product.productType}
                            </p>
                          </div>
                          <p className="price-name-sale">Preço do imóvel</p>
                          <p className="product-price-sale">
                            R$ {product.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {visibleProducts < products.length && (
              <button className="load-more-button" onClick={loadMore}>
                Ver mais
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
