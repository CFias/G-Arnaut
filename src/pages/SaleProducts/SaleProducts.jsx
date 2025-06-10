import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../services/FirebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  MenuItem,
  Select,
  Breadcrumbs,
  Typography,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
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
  const [propertyType, setPropertyType] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("venda");
  const [filterActive, setFilterActive] = useState(false);
  const navigate = useNavigate();

  const createWhatsAppLink = () => {
    const baseMessage = `Olá, Gildavi!\nVi alguns imóveis no seu site e gostaria de ter um atendimento personalizado.\nEstou procurando por: ${propertyType}`;
    const encodedMessage = encodeURIComponent(baseMessage);
    return `https://wa.me/5571991900974?text=${encodedMessage}`;
  };

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const q = filterActive
        ? query(productsRef, where("productType", "==", selectedProductType))
        : productsRef;
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const saleProducts = productList.filter(
        (product) => product.productType === selectedProductType
      );

      const distinctCategories = [
        ...new Set(saleProducts.map((p) => p.category)),
      ];

      const counts = distinctCategories.reduce((acc, category) => {
        acc[category] = saleProducts.filter(
          (p) => p.category === category
        ).length;
        return acc;
      }, {});

      const statusData = saleProducts.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});

      const cityData = saleProducts.reduce((acc, p) => {
        acc[p.city] = (acc[p.city] || 0) + 1;
        return acc;
      }, {});

      const dimensionData = saleProducts.reduce((acc, p) => {
        const dim = p.dimension;
        if (dim >= 20 && dim <= 500) {
          const range = Math.floor(dim / 100) * 100;
          acc[range] = (acc[range] || 0) + 1;
        }
        return acc;
      }, {});

      const parkingData = saleProducts.reduce((acc, p) => {
        acc[p.parkingSpaces] = (acc[p.parkingSpaces] || 0) + 1;
        return acc;
      }, {});

      setCategories(distinctCategories);
      setCategoryCounts(counts);
      setProducts(saleProducts);
      setTotalProperties(saleProducts.length);
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
  }, [selectedProductType, filterActive]);

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

  const toggleCategories = () => setShowCategories(!showCategories);
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

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="product-type-label">Tipo de Imóvel</InputLabel>
              <Select
                labelId="product-type-label"
                value={selectedProductType}
                label="Tipo de Imóvel"
                onChange={(e) => setSelectedProductType(e.target.value)}
                disabled={!filterActive}
              >
                <MenuItem value="venda">Venda</MenuItem>
                <MenuItem value="aluguel">Aluguel</MenuItem>
                <MenuItem value="temporada">Temporada</MenuItem>
                <MenuItem value="lancamento">Lançamento</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={filterActive}
                  onChange={() => setFilterActive(!filterActive)}
                />
              }
              label="Ativar filtro de tipo"
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="sort-label">Ordenar por</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOrder}
                label="Ordenar por"
                onChange={handleSortChange}
              >
                <MenuItem value="">Padrão</MenuItem>
                <MenuItem value="low-to-high">Menor Preço</MenuItem>
                <MenuItem value="high-to-low">Maior Preço</MenuItem>
              </Select>
            </FormControl>

            <p className="total-properties">{totalProperties} Resultados</p>

            {showCategories && (
              <div className="categories-section">
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
                <div className="filters-sale">
                  <h4>Status</h4>
                  <ul>
                    {Object.entries(statusCounts).map(([k, v]) => (
                      <li key={k}>
                        {k} ({v})
                      </li>
                    ))}
                  </ul>

                  <h4>Cidades</h4>
                  <ul>
                    {Object.entries(cityCounts).map(([k, v]) => (
                      <li key={k}>
                        {k} ({v})
                      </li>
                    ))}
                  </ul>

                  <h4>Dimensão (m²)</h4>
                  <ul>
                    {Object.entries(dimensionCounts).map(([k, v]) => (
                      <li key={k}>
                        {k}m² ({v})
                      </li>
                    ))}
                  </ul>

                  <h4>Vagas de Estacionamento</h4>
                  <ul>
                    {Object.entries(parkingCounts).map(([k, v]) => (
                      <li key={k}>
                        {k} vagas ({v})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!showCategories && (
              <div className="show-categories-button">
                <button onClick={toggleCategories}>Mostrar Categorias</button>
              </div>
            )}
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
