import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "../../services/FirebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NavLink } from "react-router-dom";
import "./styles.css";

export const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    price: "",
    refProduct: "",
    description: "",
    category: "",
  });

  const [dragging, setDragging] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);

  const imagePreviewRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      Object.keys(searchFilters).every((key) => {
        if (!searchFilters[key]) return true;
        return String(product[key])
          .toLowerCase()
          .includes(searchFilters[key].toLowerCase());
      })
    );
    setFilteredProducts(filtered);
  }, [searchFilters, products]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditProduct({ ...product });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const uploadedImages = await Promise.all(
        newImages.map(async (imageFile) => {
          const imageRef = ref(
            storage,
            `products/${Date.now()}_${imageFile.name}`
          );
          const snapshot = await uploadBytes(imageRef, imageFile);
          return getDownloadURL(snapshot.ref);
        })
      );

      const updatedProduct = {
        ...editProduct,
        images: [...editProduct.images, ...uploadedImages],
      };

      const docRef = doc(db, "products", editProduct.id);
      await updateDoc(docRef, updatedProduct);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === editProduct.id ? updatedProduct : product
        )
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleSetMainImage = (imageUrl) => {
    setEditProduct((prev) => ({
      ...prev,
      mainImage: imageUrl, // Defina a imagem principal
    }));
  };

  const handleDragStart = (e, index) => {
    setDragging(true);
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedImageIndex === index) return;

    // Adiciona a classe "over" quando uma imagem está sendo arrastada sobre outra
    const imageElements =
      imagePreviewRef.current.querySelectorAll(".image-item");
    imageElements.forEach((image, i) => {
      if (i === index) {
        image.classList.add("over");
      } else {
        image.classList.remove("over");
      }
    });
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedImageIndex === index) return;

    const updatedImages = [...editProduct.images];
    const draggedImage = updatedImages[draggedImageIndex];
    updatedImages[draggedImageIndex] = updatedImages[index];
    updatedImages[index] = draggedImage;

    // Define a nova imagem principal (primeira da lista)
    setEditProduct((prev) => ({
      ...prev,
      images: updatedImages,
      mainImage: updatedImages[0], // A primeira imagem agora é a principal
    }));

    // Remove a classe "over" ao soltar
    const imageElements =
      imagePreviewRef.current.querySelectorAll(".image-item");
    imageElements.forEach((image) => image.classList.remove("over"));

    setDragging(false);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="manage-products-container">
      <NavLink to="/admin">Voltar</NavLink>
      <h2 className="manage-products-heading">Gerenciar Produtos</h2>
      <div className="search-filters">
        <input
          type="text"
          placeholder="Buscar por preço"
          name="price"
          value={searchFilters.price}
          onChange={handleSearchChange}
        />
        <input
          type="text"
          placeholder="Buscar por referência"
          name="refProduct"
          value={searchFilters.refProduct}
          onChange={handleSearchChange}
        />
        <input
          type="text"
          placeholder="Buscar por descrição"
          name="description"
          value={searchFilters.description}
          onChange={handleSearchChange}
        />
        <input
          type="text"
          placeholder="Buscar por categoria"
          name="category"
          value={searchFilters.category}
          onChange={handleSearchChange}
        />
      </div>
      <table className="products-table">
        <thead>
          <tr>
            <th>Endereço</th>
            <th>Preço</th>
            <th>Categoria</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.address}</td>
              <td>{product.price}</td>
              <td>{product.category}</td>
              <td>{product.status}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleEdit(product)}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(product.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Produto</h3>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                {Object.keys(editProduct)
                  .filter((key) => key !== "id" && key !== "images")
                  .map((key) => (
                    <div className="form-group" key={key}>
                      <label htmlFor={key}>
                        {key === "address"
                          ? "Endereço"
                          : key === "price"
                          ? "Preço"
                          : key === "category"
                          ? "Categoria"
                          : key === "status"
                          ? "Status"
                          : key === "oldPrice"
                          ? "Preço antigo"
                          : key === "description"
                          ? "Descrição"
                          : key === "neighborhood"
                          ? "Bairro"
                          : key === "image"
                          ? "Imagem"
                          : key === "id"
                          ? "ID"
                          : key === "parkingSpaces"
                          ? "Vagas de estacionamento"
                          : key === "state"
                          ? "Estado"
                          : key === "isFeatured"
                          ? "Destaque"
                          : key === "size"
                          ? "Tamanho"
                          : key === "city"
                          ? "Cidade"
                          : key === "stock"
                          ? "Estoque"
                          : key === "mainImage"
                          ? "Imagem principal"
                          : key === "productType"
                          ? "Imóvel para"
                          : key === "bedrooms"
                          ? "Quartos"
                          : key === "refProduct"
                          ? "Referência do produto"
                          : key === "dimension"
                          ? "Dimensão"
                          : key}
                      </label>

                      <input
                        type="text"
                        value={editProduct[key]}
                        onChange={(e) =>
                          setEditProduct({
                            ...editProduct,
                            [key]: e.target.value,
                          })
                        }
                        id={key}
                      />
                    </div>
                  ))}
                <div className="form-group">
                  <label>Link do Vídeo</label>
                  <input
                    type="text"
                    value={editProduct.videoLink || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        videoLink: e.target.value,
                      })
                    }
                    placeholder="Adicionar link do vídeo"
                  />
                </div>
              </div>
              {/* Exibir imagens do produto no modal */}
              <div className="form-group">
                <label>Imagens</label>
                <div
                  ref={imagePreviewRef}
                  className={`image-preview ${dragging ? "dragging" : ""}`}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragOver}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  {editProduct.images &&
                    editProduct.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className={`image-item ${index === 0 ? "main" : ""}`} // Adiciona a classe "main" à primeira imagem
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <img
                          className="product-image"
                          src={imageUrl}
                          alt={`Product Image ${index + 1}`}
                        />
                      </div>
                    ))}
                </div>
              </div>
              <div className="form-group">
                <label>Adicionar novas imagens</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </div>
              <button type="submit" disabled={isUploading}>
                {isUploading ? "Carregando..." : "Atualizar Produto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
