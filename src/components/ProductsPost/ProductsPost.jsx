import React, { useEffect, useState } from "react";
import { db, storage } from "../../services/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { Category, CropFree, DirectionsCar, Hotel } from "@mui/icons-material";
import "./styles.css";

export const ProductsPost = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // Maximum products per page
  const productsPerRow = 4; // Products per row

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const productsWithImages = await Promise.all(
          productList.map(async (product) => {
            if (product.images && product.images.length > 0) {
              const imageUrls = await Promise.all(
                product.images.map(async (imagePath) => {
                  try {
                    const imageRef = ref(storage, imagePath);
                    const downloadURL = await getDownloadURL(imageRef);
                    return downloadURL;
                  } catch (error) {
                    console.error("Erro ao obter URL da imagem:", error);
                    return null;
                  }
                })
              );
              return { ...product, images: imageUrls.filter(Boolean) };
            }
            return product;
          })
        );

        setProducts(productsWithImages);
      } catch (error) {
        console.error("Erro ao buscar produtos: ", error);
      }
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <>
      <div className="product-container">
        <div className="product-list">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.images && product.images.length > 0 && (
                <div className="product-images">
                  <p className="product-status">{product.status}</p>
                  <p className="product-ref">
                    Referência: {product.refProduct}
                  </p>
                  <img
                    className="product-img"
                    src={product.images[0]}
                    alt="Product image"
                  />
                </div>
              )}
              <div className="product-infos">
                <h3 className="product-address">{product.address}</h3>
                <p className="product-neighborhood">{product.neighborhood}</p>
                <p className="product-category"><Category fontSize="small" /> {product.category}</p>
                <div className="product-dimension">
                  <CropFree className="product-icon" fontSize="small" />{" "}
                  <p className="product-size">{product.dimension} m²</p>
                </div>
                <div className="product-dimension">
                  <Hotel className="product-icon" fontSize="small" />{" "}
                  <p className="product-size">{product.bedrooms}</p>
                </div>
                <div className="product-dimension">
                  <DirectionsCar className="product-icon" fontSize="small" />{" "}
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
          ))}
        </div>
        <div className="pagination-dots">
          {Array.from({ length: totalPages }, (_, index) => (
            <span
              key={index}
              className={`dot ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};
