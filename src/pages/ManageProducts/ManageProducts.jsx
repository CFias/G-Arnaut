import React, { useEffect, useState } from "react";
import { db } from "../../services/FirebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import "./styles.css";
import { NavLink } from "react-router-dom";

export const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    price: "",
    refProduct: "",
    description: "",
    category: "",
  });

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "products", editProduct.id);
      await updateDoc(docRef, { ...editProduct });
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editProduct.id ? editProduct : product
        )
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
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
                  onClick={() => {
                    setIsEditing(true);
                    setEditProduct({ ...product });
                  }}
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
              <input
                type="text"
                placeholder="Endereço"
                value={editProduct.address}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, address: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Preço"
                value={editProduct.price}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, price: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Categoria"
                value={editProduct.category}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, category: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Status"
                value={editProduct.status}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, status: e.target.value })
                }
              />
              <button className="modal-save-button" type="submit">
                Salvar
              </button>
              <button
                className="modal-cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
