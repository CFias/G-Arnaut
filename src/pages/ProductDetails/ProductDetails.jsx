import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import { CalendarToday, East, West, WhatsApp } from "@mui/icons-material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { Navbar } from "../../components/Navbar/Navbar";
import Logo from "../../assets/image/garnaut-white-logo.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./styles.css";

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Busca o produto específico baseado no id
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, "products", id); // Usando o id para buscar o produto
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);
          setSelectedImage(productData.images[0]); // Define a primeira imagem como a imagem principal
        } else {
          console.log("Produto não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
      }
    };

    fetchProduct();
  }, [id]);

  // Busca produtos recomendados
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = getDocs(productsRef); // Aqui você pode adicionar filtros, como buscar produtos da mesma categoria ou cidade
        const querySnapshot = await q;
        const recommendedProductsData = [];

        querySnapshot.forEach((doc) => {
          recommendedProductsData.push({ id: doc.id, ...doc.data() });
        });

        setRecommendedProducts(recommendedProductsData);
      } catch (error) {
        console.error("Erro ao buscar produtos recomendados:", error);
      }
    };

    fetchRecommendedProducts();
  }, []);

  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    }
    return "Data não disponível";
  };

  const generateWhatsappMessage = () => {
    const productLink = `https://g-arnaut.vercel.app/product/${product.id}`;
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
    setSelectedVideo(null);
    setModalImages(product.images); // Mostrar todas as imagens no modal
    setModalImageIndex(0);
    setIsModalOpen(true);
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

  function extractVideoId(url) {
    if (!url) return null;

    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (!product) {
    return (
      <div className="loading">
        <img className="loading-logo" src={Logo} alt="Arnaut" />
        <Skeleton height={300} />
        <Skeleton width="60%" />
        <Skeleton width="80%" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="product-details-container">
        <div className="product-details-content">
          <div className="image-container">
            <div className="thumbnails-container">
              {product.images &&
                product.images
                  .slice(0, 6)
                  .map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Miniatura ${index}`}
                      className={`thumbnail ${
                        image === selectedImage ? "active-thumbnail" : ""
                      }`}
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
            </div>
            {selectedImage && (
              <div
                className="main-image-container"
                onClick={() => handleImageClick(selectedImage)}
              >
                <img
                  src={selectedImage}
                  alt="Imagem principal do produto"
                  className="main-image"
                />
              </div>
            )}
          </div>
          <div className="videos-list-container">
            <div className="videos-list-content">
              <h3>Vídeo do imóvel</h3>
              {product.videoLink && extractVideoId(product.videoLink) ? (
                <div className="video-imovel">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractVideoId(
                      product.videoLink
                    )}`}
                    title="Vídeo do Produto"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="main-video"
                  />
                </div>
              ) : (
                <p>Vídeo não disponível para este imóvel.</p>
              )}
            </div>
          </div>
          <div className="recommended-products-container">
            <h2 className="recommended-h2">Outros imóveis</h2>
            <div className="recommended-products">
              {recommendedProducts.map((recommendedProduct) => (
                <div
                  className="recommended-product-card"
                  key={recommendedProduct.id}
                >
                  <Link
                    className="recommended-link"
                    to={`/product/${recommendedProduct.id}`}
                    onClick={() => {
                      scrollToTop();
                    }}
                  >
                    <img
                      src={recommendedProduct.images[0]}
                      alt={recommendedProduct.name}
                      className="recommended-product-image"
                    />
                    <div className="recommended-infos">
                      <div className="recommended-product-local">
                        <p>
                          {recommendedProduct.city}-{recommendedProduct.state}
                        </p>
                      </div>
                      <div className="recommended-product-address">
                        {recommendedProduct.address}
                      </div>
                      <div className="recommended-product-status">
                        {recommendedProduct.status}
                      </div>
                      <div className="recommended-product-type">
                        {recommendedProduct.productType}
                      </div>
                      <div className="recommended-product-price">
                        R$ {recommendedProduct.price}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="product-details">
          <div className="product-ref-one">
            <div className="info-container">
              <div className="info-content">
                <h1 className="detail-h1">
                  {product.city} {product.state}
                </h1>
                <div className="detail-address">{product.address}</div>
                <div className="detail-price">R$ {product.price}</div>
                <div className="detail-dimension">{product.dimension} m²</div>
                <div className="detail-status">{product.status}</div>
                <div className="detail-category">{product.category}</div>
                <div className="detail-description">
                  <p>{product.description}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (typeof window.gtag === "function") {
                    window.gtag("event", "conversion", {
                      send_to: "AW-16519300622/XXXXXXXXXXX", // seu ID de conversão
                    });
                  }

                  const urlImovel = `https://www.arnautimoveis.com/product/${product.id}`;

                  const mensagem = `
Olá, tenho interesse no imóvel:
Cidade: ${product.city}
Endereço: ${product.address}
Preço: R$ ${product.price}
Dimensão: ${product.dimension} m²
Categoria: ${product.category}
Status: ${product.status}
Descrição: ${product.description}

Veja mais detalhes aqui: ${urlImovel}
`;

                  const encodedMensagem = encodeURIComponent(mensagem.trim());

                  const urlWpp = `https://wa.me/557191900974?text=${encodedMensagem}`;

                  window.open(urlWpp, "_blank");
                }}
                className="whatsapp-button"
              >
                Fale comigo no WhatsApp
              </button>
            </div>
          </div>
        </div>
        <div className="recommended-products-container-mobile">
          <h2 className="recommended-h2">Outros imóveis</h2>
          <div className="recommended-products">
            {recommendedProducts.map((recommendedProduct) => (
              <div
                className="recommended-product-card"
                key={recommendedProduct.id}
              >
                <Link
                  className="recommended-link"
                  to={`/product/${recommendedProduct.id}`}
                  onClick={() => {
                    scrollToTop();
                  }}
                >
                  <img
                    src={recommendedProduct.images[0]}
                    alt={recommendedProduct.name}
                    className="recommended-product-image"
                  />
                  <div className="recommended-infos">
                    <div className="recommended-product-local">
                      <p>
                        {recommendedProduct.city}-{recommendedProduct.state}
                      </p>
                    </div>
                    <div className="recommended-product-address">
                      {recommendedProduct.address}
                    </div>
                    <div className="recommended-product-status">
                      {recommendedProduct.status}
                    </div>
                    <div className="recommended-product-type">
                      {recommendedProduct.productType}
                    </div>
                    <div className="recommended-product-price">
                      R$ {recommendedProduct.price}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        {isModalOpen && (
          <div className="modal" onClick={handleModalClick}>
            <div
              className="modal-content-img"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="close-modal" onClick={handleCloseModal}></div>
              <div className="modal-navigation">
                <button className="prev-button" onClick={handlePreviousImage}>
                  <West />
                </button>
                <img
                  src={modalImages[modalImageIndex]}
                  alt="Imagem principal do modal"
                  className="modal-image-product"
                />
                <button className="next-button" onClick={handleNextImage}>
                  <East />
                </button>
              </div>
              <div className="image-counter">
                {modalImageIndex + 1}/{modalImages.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
