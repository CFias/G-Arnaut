import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import { CalendarToday } from "@mui/icons-material";
import { Navbar } from "../../components/Navbar/Navbar";
import "./styles.css";

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0]);
          }
        } else {
          console.error("Produto não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar os detalhes do produto:", error);
      }
    };

    const fetchRecommendedProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        setRecommendedProducts(products);
      } catch (error) {
        console.error("Erro ao buscar produtos recomendados:", error);
      }
    };

    fetchProductDetails();
    fetchRecommendedProducts();
  }, [id]);

  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    }
    return "Data não disponível";
  };

  const generateWhatsappMessage = () => {
    return `Olá, estou interessado no imóvel:

Referência: ${product.refProduct}
Cidade: ${product.city}
Estado: ${product.state}
Endereço: ${product.address}
Bairro: ${product.neighborhood}
Preço: R$ ${product.price}
Categoria: ${product.category}
Dimensão: ${product.dimension} m²
Dormitórios: ${product.bedrooms}
Vagas para carros: ${product.parkingSpaces}

Gostaria de saber mais detalhes.`;
  };

  const handleWhatsappClick = () => {
    const whatsappMessage = generateWhatsappMessage();
    const whatsappNumber = "557191900974";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;
    window.open(whatsappURL, "_blank");
  };

  if (!product) {
    return <p>Carregando...</p>;
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <>
      <Navbar />
      <div className="product-details-container">
        <div className="product-details">
          <div className="image-container">
            <div className="thumbnails-container">
              {product.images &&
                product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Miniatura ${index}`}
                    className={`thumbnail ${
                      image === selectedImage ? "active-thumbnail" : ""
                    }`}
                    onClick={() => handleImageClick(image)}
                  />
                ))}
            </div>
            {selectedImage && (
              <div className="main-image-container">
                <img
                  src={selectedImage}
                  alt="Imagem principal do produto"
                  className="main-image"
                />
              </div>
            )}
          </div>
          <div className="info-container">
            <p className="detail-data">
              <CalendarToday fontSize="10" /> {formatDate(product.createdAt)}
            </p>
            <p className="detail-status">{product.status}</p>
            <p className="detail-category">{product.category}</p>
            <h1 className="detail-h1">
              {product.city} {product.state}
            </h1>
            <p className="detail-address">{product.address}</p>
            <p className="detail-neighborhood">{product.neighborhood}</p>
            <p className="detail-dimension">Dimensão: {product.dimension}m²</p>
            <p className="detail-bedrooms">Dormitórios: {product.bedrooms}</p>
            <p className="detail-parkingSpaces">
              Vagas para carros: {product.parkingSpaces}
            </p>
            <p className="detail-productType">
              Imóvel para: {product.productType}
            </p>
            {product.oldPrice && (
              <p className="detail-oldPrice">
                <s> R$ {product.oldPrice}</s>{" "}
              </p>
            )}
            <p className="detail-price">
              R$ {product.price.split(".")[0]}
              <span className="detail-price-decimal">
                .{product.price.split(".")[1]}
              </span>
            </p>
            <button className="whatsapp-button" onClick={handleWhatsappClick}>
              Falar no WhatsApp
            </button>
          </div>
        </div>
        {/* Produtos recomendados */}
        <div className="recommended-products-container">
          <h2>Produtos Recomendados</h2>
          <div className="recommended-products">
            {recommendedProducts.map((recommendedProduct) => (
              <div
                className="recommended-product-card"
                key={recommendedProduct.id}
              >
                <Link to={`/product-details/${recommendedProduct.id}`}>
                  <img
                    src={recommendedProduct.images[0]}
                    alt={recommendedProduct.name}
                    className="recommended-product-image"
                  />
                  <p className="recommended-product-name">
                    {recommendedProduct.name}
                  </p>
                  <p className="recommended-product-price">
                    R$ {recommendedProduct.price.split(".")[0]}
                    <span className="recommended-product-price-decimal">
                      .{recommendedProduct.price.split(".")[1]}
                    </span>
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
