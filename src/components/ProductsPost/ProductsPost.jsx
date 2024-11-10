import React, { useEffect, useState } from "react";
import { db, storage } from "../../services/FirebaseConfig"; // Certifique-se de importar storage
import { collection, getDocs, query, where } from "firebase/firestore"; // Importando query e where para filtragem
import { getDownloadURL, ref } from "firebase/storage";
import { CropFree, DirectionsCar, Hotel } from "@mui/icons-material";
import "./styles.css"; // Importando o arquivo de estilo

export const ProductsPost = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]); // Novo estado para produtos em destaque

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Consulta para buscar todos os produtos
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Para cada produto, obtenha as URLs das imagens
        const productsWithImages = await Promise.all(
          productList.map(async (product) => {
            if (product.images && product.images.length > 0) {
              const imageUrls = await Promise.all(
                product.images.map(async (imagePath) => {
                  try {
                    // Criando uma referência para cada imagem no Storage
                    const imageRef = ref(storage, imagePath);
                    const downloadURL = await getDownloadURL(imageRef); // Obter URL pública
                    console.log("URL da Imagem:", downloadURL); // Logar a URL para depuração
                    return downloadURL;
                  } catch (error) {
                    console.error("Erro ao obter URL da imagem:", error);
                    return null; // Retorna null caso a URL não possa ser carregada
                  }
                })
              );
              return { ...product, images: imageUrls.filter(Boolean) }; // Filtra URLs inválidas (null)
            }
            return product; // Se não houver imagens, retorna o produto sem alteração
          })
        );

        // Definindo os produtos com e sem destaque
        const featured = productsWithImages.filter(
          (product) => product.isFeatured
        );
        setFeaturedProducts(featured); // Atualizando o estado dos produtos em destaque
        setProducts(productsWithImages); // Atualizando todos os produtos
        console.log("Produtos com imagens recuperadas: ", productsWithImages);
      } catch (error) {
        console.error("Erro ao buscar produtos: ", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="product-card">
              {product.images && product.images.length > 0 && (
                <div className="product-images">
                  <p className="product-status">{product.status}</p>
                  <img
                    className="product-img"
                    src={product.images[0]} // Acessando a URL pública da primeira imagem
                    alt="Product image"
                  />
                </div>
              )}
              <div className="product-infos">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">Referência: {product.refProduct}</p>
                <p className="product-neighborhood">{product.neighborhood}</p>
                <p className="product-category">{product.category}</p>
                <div className="product-dimension">
                  <CropFree fontSize="small" />{" "}
                  <p className="product-size">{product.dimension} m²</p>
                </div>
                <div className="product-dimension">
                  <Hotel fontSize="small" />{" "}
                  <p className="product-size">{product.bedrooms}</p>
                </div>
                <div className="product-dimension">
                  <DirectionsCar fontSize="small" />{" "}
                  <p className="product-size">{product.parkingSpaces}</p>
                </div>
                <div className="product-price-mod">
                  <div className="product-oldPrice">
                    <s>R$ {product.oldPrice}</s>
                    <p className="product-price">R$ {product.price}</p>
                  </div>
                  <h3 className="product-type">{product.productType}</h3>
                </div>
              </div>
            </div>
          ))
        ) : (
          null
        )}
      </div>
    </>
  );
};
