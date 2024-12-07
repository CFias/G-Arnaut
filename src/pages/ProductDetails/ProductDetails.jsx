import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import "./styles.css";
import { CalendarToday } from "@mui/icons-material";
import { Navbar } from "../../components/Navbar/Navbar";

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0]); // Define a primeira imagem como padrão
          }
        } else {
          console.error("Nenhum documento encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar os detalhes do produto:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Função para formatar o Timestamp para data legível
  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleDateString(); // Você pode personalizar o formato da data se necessário
    }
    return "Data não disponível";
  };

  // Função para criar a URL do WhatsApp com as informações do imóvel
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
    const whatsappNumber = "557191900974"; // Substitua com o número de telefone real (com código do país)
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
            </p>{" "}
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
            <p className="detail-oldPrice">
              <s> R$ {product.oldPrice}</s>{" "}
            </p>
            <p className="detail-price">
              R$ {product.price.split(".")[0]}
              <span className="detail-price-decimal">
                .{product.price.split(".")[1]}
              </span>
            </p>
            {/* Botão WhatsApp */}
            <button className="whatsapp-button" onClick={handleWhatsappClick}>
              Falar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
