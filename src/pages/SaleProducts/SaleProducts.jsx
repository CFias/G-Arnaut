import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../services/FirebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MenuItem, Select, Breadcrumbs, Typography } from "@mui/material";
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
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("");

  const createWhatsAppLink = () => {
    const baseMessage = `Olá, Gildavi!\nVi alguns imóveis no seu site e gostaria de ter um atendimento personalizado.\nEstou procurando por: ${propertyType}`;
    const encodedMessage = encodeURIComponent(baseMessage);
    return `https://wa.me/5571991900974?text=${encodedMessage}`;
  };

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("productType", "==", "venda"));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const saleProducts = productList.filter(
        (product) => product.productType === "venda"
      );

      const distinctCategories = [
        ...new Set(saleProducts.map((product) => product.category)),
      ];

      const counts = distinctCategories.reduce((acc, category) => {
        acc[category] = saleProducts.filter(
          (product) => product.category === category
        ).length;
        return acc;
      }, {});

      const statusData = saleProducts.reduce((acc, product) => {
        acc[product.status] = (acc[product.status] || 0) + 1;
        return acc;
      }, {});

      const cityData = saleProducts.reduce((acc, product) => {
        acc[product.city] = (acc[product.city] || 0) + 1;
        return acc;
      }, {});

      const dimensionData = saleProducts.reduce((acc, product) => {
        const dimension = product.dimension;
        if (dimension >= 20 && dimension <= 500) {
          const range = Math.floor(dimension / 100) * 100;
          acc[range] = (acc[range] || 0) + 1;
        }
        return acc;
      }, {});

      const parkingData = saleProducts.reduce((acc, product) => {
        acc[product.parkingSpaces] = (acc[product.parkingSpaces] || 0) + 1;
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
  }, []);

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

  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };

  const loadMore = () => {
    setVisibleProducts((prev) => prev + 12);
  };

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
        <div className="sort-dropdown">
          <div className="select-filter">
            <Select
              value={sortOrder}
              onChange={handleSortChange}
              displayEmpty
              className="filter-sale"
            >
              <MenuItem className="item-custom-p" value="">
                Ordenar por
              </MenuItem>
              <MenuItem className="menu-item-custom" value="low-to-high">
                Menor Preço
              </MenuItem>
              <MenuItem className="menu-item-custom" value="high-to-low">
                Maior Preço
              </MenuItem>
            </Select>
          </div>
        </div>
        <div className="filter-product-content-sale">
          <div className="filter-side-sale-container">
            <div className="filter-side-sale">
              <p className="filter-title-sale">Venda</p>
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
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <li key={status}>
                          {status} ({count})
                        </li>
                      ))}
                    </ul>

                    <h4>Cidades</h4>
                    <ul>
                      {Object.entries(cityCounts).map(([city, count]) => (
                        <li key={city}>
                          {city} ({count})
                        </li>
                      ))}
                    </ul>

                    <h4>Dimensão (m²)</h4>
                    <ul>
                      {Object.entries(dimensionCounts).map(([range, count]) => (
                        <li key={range}>
                          {range}m² ({count})
                        </li>
                      ))}
                    </ul>

                    <h4>Vagas de Estacionamento</h4>
                    <ul>
                      {Object.entries(parkingCounts).map(([spaces, count]) => (
                        <li key={spaces}>
                          {spaces} vagas ({count})
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
            <div className="card-sale">
              <div className="sale-infos-card">
                <h2>Inscreva-se no canal</h2>
                <p>Acompanhe os detalhes de cada imóvel</p>
              </div>
              <a
                className="whatsapp-link"
                href="https://youtube.com/@daviarnaut9716?si=bmPSV-84PBMfkUVh" // ⬅️ Substitua pelo link real do seu canal
                target="_blank"
                rel="noopener noreferrer"
              >
                <button>Acessar canal</button>
              </a>
            </div>

            <div className="card-sale">
              <div className="sale-infos-card">
                <h2>Deseja um atendimento personalizado?</h2>
                <p>Informe o tipo de imóvel que você procura:</p>
                <input
                  type="text"
                  placeholder="Ex: Casa com 3 quartos, apartamento no centro..."
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="whatsapp-input"
                />
              </div>
              <a
                href={createWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-link"
              >
                <button disabled={!propertyType}>
                  Atendimento personalizado
                </button>
              </a>
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
