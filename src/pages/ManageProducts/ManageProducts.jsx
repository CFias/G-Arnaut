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

  // Modal delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const imagePreviewRef = useRef(null);

  // Mapeamento das chaves para labels amigáveis
  const labelMap = {
    address: "Endereço",
    price: "Preço",
    category: "Categoria",
    status: "Status",
    description: "Descrição",
    neighborhood: "Bairro",
    image: "Imagem",
    parkingSpaces: "Vagas de estacionamento",
    state: "Estado",
    isFeatured: "Destaque",
    size: "Tamanho",
    city: "Cidade",
    stock: "Estoque",
    mainImage: "Imagem principal",
    productType: "Imóvel para",
    bedrooms: "Quartos",
    refProduct: "Referência do produto",
    dimension: "Dimensão",
  };

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

  // Abre modal e define qual produto será excluído
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Executa a exclusão após confirmação
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      setProducts((prev) =>
        prev.filter((product) => product.id !== productToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
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

    setEditProduct((prev) => ({
      ...prev,
      images: updatedImages,
      mainImage: updatedImages[0], // A primeira imagem agora é a principal
    }));

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
      <NavLink className="access-back" to="/admin">
        Voltar
      </NavLink>
      <h2 className="manage-products-heading">Gerenciar Produtos</h2>
      <div className="search-filters">
        <input
          type="text"
          placeholder="Buscar por preço"
          name="price"
          value={searchFilters.price}
          onChange={handleSearchChange}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Buscar por referência"
          name="refProduct"
          value={searchFilters.refProduct}
          onChange={handleSearchChange}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Buscar por descrição"
          name="description"
          value={searchFilters.description}
          onChange={handleSearchChange}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Buscar por categoria"
          name="category"
          value={searchFilters.category}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <table className="products-table">
        <thead>
          <tr>
            <th>Endereço</th>
            <th>Destaque</th>
            <th>Referência</th>
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
              <td>{product.isFeatured ? "Sim" : "Não"}</td>
              <td>{product.refProduct}</td>
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
                  onClick={() => confirmDelete(product)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="modal-delete">
          <div className="modal-content-delete">
            <h3>Confirmar exclusão</h3>
            <p>
              Tem certeza que deseja excluir o produto{" "}
              <strong>{productToDelete?.refProduct}</strong>?
            </p>
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button className="confirm-button" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && editProduct && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Produto</h3>
            <form onSubmit={handleUpdate} className="form-content">
              <div className="form-grid">
                {[
                  "address",
                  "price",
                  "dimension",
                  "state",
                  "city",
                  "neighborhood",
                  "refProduct",
                  "bedrooms",
                  "parkingSpaces",
                ].map((field) => (
                  <div className="form-group" key={field}>
                    <label className="form-label">
                      {labelMap[field] || field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={editProduct[field] || ""}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct,
                          [field]: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    name="category"
                    value={editProduct.category || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                    className="form-input"
                    required
                  >
                    <option value="">Selecione uma Categoria</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Fazenda">Fazenda</option>
                    <option value="Sítio">Sítio</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Galpão">Galpão</option>
                    <option value="Sala Comercial">Sala Comercial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <textarea
                    name="description"
                    value={editProduct.description || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        description: e.target.value,
                      })
                    }
                    className="form-textarea"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Link do Vídeo (YouTube)</label>
                  <input
                    type="url"
                    name="videoLink"
                    value={editProduct.videoLink || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        videoLink: e.target.value,
                      })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status do Imóvel</label>
                  <select
                    name="status"
                    value={editProduct.status || ""}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, status: e.target.value })
                    }
                    className="form-input"
                    required
                  >
                    <option value="">Selecione o Status</option>
                    <option value="Obra finalizada">Pronto para morar</option>
                    <option value="Lançamento">Lançamento</option>
                    <option value="Reformando">Reformando</option>
                    <option value="Recém reformado">Recém reformado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Imóvel para:</label>
                  <select
                    name="productType"
                    value={editProduct.productType || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        productType: e.target.value,
                      })
                    }
                    className="form-input"
                    required
                  >
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Destaque</label>
                  <select
                    name="isFeatured"
                    value={editProduct.isFeatured || "não"}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        isFeatured: e.target.value,
                      })
                    }
                    className="form-input"
                    required
                  >
                    <option value="não">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
              <div className="form-group-images">
                <div ref={imagePreviewRef} className="image-preview-container">
                  {editProduct.images &&
                    editProduct.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="image-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                          border:
                            imageUrl === editProduct.mainImage
                              ? "4px solid green"
                              : "1px solid gray",
                          padding: "0px",
                          cursor: "move",
                          borderRadius: "5px",
                        }}
                        onClick={() => handleSetMainImage(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          width={100}
                          height={100}
                          style={{ objectFit: "cover" }}
                          className="image-preview"
                        />
                      </div>
                    ))}
                  <div />
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </div>
              <button
                type="submit"
                className="form-button"
                disabled={isUploading}
              >
                {isUploading ? "Atualizando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
