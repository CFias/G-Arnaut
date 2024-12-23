import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import { CalendarToday, WhatsApp } from "@mui/icons-material";
import { Favorite, FavoriteBorder } from "@mui/icons-material"; // Importando ícones
import { Navbar } from "../../components/Navbar/Navbar";
import "./styles.css";

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false); // Estado de favorito

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
    const productLink = `https://g-arnaut.vercel.app/product/${product.id}`; // Substitua pelo link real do produto
    const imageLink = `${product.images}`; // URL da imagem do produto

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

Gostaria de saber mais detalhes.

Veja o produto: ${productLink}`;
  };

  const handleWhatsappClick = () => {
    const whatsappMessage = generateWhatsappMessage();
    const whatsappNumber = "557191900974";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;
    window.open(whatsappURL, "_blank");
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleViewMoreClick = () => {
    if (product.images) {
      setModalImages(product.images.slice(8)); // Exibe as imagens após as 8 primeiras
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNextImage = () => {
    if (modalImageIndex < modalImages.length - 1) {
      setModalImageIndex(modalImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (modalImageIndex > 0) {
      setModalImageIndex(modalImageIndex - 1);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite((prevState) => !prevState);
  };

  if (!product) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Navbar />
      <div className="product-details-container">
        <div className="product-details">
          <div className="product-ref-one">
            <div className="image-container">
              <div className="thumbnails-container">
                {product.images &&
                  product.images
                    .slice(0, 7) // Limita a 8 imagens
                    .map((image, index) => (
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
              {product.images && product.images.length > 7 && (
                <div className="view-more-card" onClick={handleViewMoreClick}>
                  <img
                    src={product.images[7]}
                    alt="Ver mais imagens"
                    className="view-more-image"
                  />
                  <p className="view-more-text">+ Ver mais</p>
                </div>
              )}

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
              <div className="info-content">
                <p className="detail-data">
                  <p>
                    <CalendarToday fontSize="10" />{" "}
                    {formatDate(product.createdAt)}
                  </p>
                  <span onClick={toggleFavorite}>
                    {isFavorite ? (
                      <Favorite fontSize="small" style={{ color: "red" }} />
                    ) : (
                      <FavoriteBorder fontSize="small" />
                    )}
                  </span>
                </p>
                <p className="detail-status">{product.status}</p>
                <p className="detail-category">{product.category}</p>
                <h1 className="detail-h1">
                  {product.city} {product.state}
                </h1>
                <p className="detail-address">{product.address}</p>
                <p className="detail-neighborhood">{product.neighborhood}</p>
                <p className="detail-dimension">
                  Dimensão: {product.dimension}m²
                </p>
                <p className="detail-bedrooms">
                  Dormitórios: {product.bedrooms}
                </p>
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
                <p className="detail-price">R$ {product.price}</p>
              </div>
              <button className="whatsapp-button" onClick={handleWhatsappClick}>
                <WhatsApp /> Falar no WhatsApp
              </button>
            </div>
          </div>
          <div className="recommended-products-container">
            <h2 className="recommended-h2">Imóveis recomendados</h2>
            <div className="recommended-products">
              {recommendedProducts.map((recommendedProduct) => (
                <div
                  className="recommended-product-card"
                  key={recommendedProduct.id}
                >
                  <Link
                    className="recommended-link"
                    to={`/product/${recommendedProduct.id}`}
                  >
                    <img
                      src={recommendedProduct.images[0]}
                      alt={recommendedProduct.name}
                      className="recommended-product-image"
                    />
                    <p className="recommended-product-local">
                      {recommendedProduct.city}-{recommendedProduct.state}
                    </p>
                    <p className="recommended-product-address">
                      {recommendedProduct.address}
                    </p>
                    <p className="recommended-product-status">
                      {recommendedProduct.status}
                    </p>
                    <p className="recommended-product-type">
                      {recommendedProduct.productType}
                    </p>
                    <p className="recommended-product-price">
                      R$ {recommendedProduct.price}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal para exibir mais imagens */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content-img">
              <button className="close-modal" onClick={handleCloseModal}>
                X
              </button>
              <div className="modal-images-container">
                <button className="prev-button" onClick={handlePreviousImage}>
                  {"<"}
                </button>
                <img
                  src={modalImages[modalImageIndex]}
                  alt="Imagem modal"
                  className="modal-image-product"
                />
                <button className="next-button" onClick={handleNextImage}>
                  {">"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
