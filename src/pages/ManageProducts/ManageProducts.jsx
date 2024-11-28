import React, { useEffect, useState } from "react";
import { db } from "../../services/FirebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState({
    id: "",
    address: "",
    price: "",
    oldPrice: "",
    status: "",
    dimension: "",
    state: "",
    city: "",
    neighborhood: "",
    category: "",
    description: "",
    refProduct: "",
    productType: "venda",
    isFeatured: false,
    bedrooms: "",
    parkingSpaces: "",
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
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle edit form input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, "products", editProduct.id);
      await updateDoc(productRef, {
        address: editProduct.address,
        price: editProduct.price,
        oldPrice: editProduct.oldPrice,
        status: editProduct.status,
        dimension: editProduct.dimension,
        state: editProduct.state,
        city: editProduct.city,
        neighborhood: editProduct.neighborhood,
        category: editProduct.category,
        description: editProduct.description,
        refProduct: editProduct.refProduct,
        productType: editProduct.productType,
        isFeatured: editProduct.isFeatured,
        bedrooms: editProduct.bedrooms,
        parkingSpaces: editProduct.parkingSpaces,
      });
      alert("Produto atualizado com sucesso!");
      setIsEditing(false);
      setEditProduct({
        id: "",
        address: "",
        price: "",
        oldPrice: "",
        status: "",
        dimension: "",
        state: "",
        city: "",
        neighborhood: "",
        category: "",
        description: "",
        refProduct: "",
        productType: "venda",
        isFeatured: false,
        bedrooms: "",
        parkingSpaces: "",
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert("Erro ao atualizar produto.");
    }
  };

  // Handle delete product
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const productRef = doc(db, "products", id);
        await deleteDoc(productRef);
        alert("Produto excluído com sucesso!");
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        alert("Erro ao excluir produto.");
      }
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <h2>Manage Products</h2>

      {isEditing ? (
        <div>
          <h3>Edit Product</h3>
          <form onSubmit={handleEditSubmit}>
            <div>
              <label>Endereço:</label>
              <input
                type="text"
                name="address"
                value={editProduct.address}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label>Preço:</label>
              <input
                type="number"
                name="price"
                value={editProduct.price}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label>Preço Antigo:</label>
              <input
                type="number"
                name="oldPrice"
                value={editProduct.oldPrice}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label>Status:</label>
              <input
                type="text"
                name="status"
                value={editProduct.status}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label>Dimensão:</label>
              <input
                type="number"
                name="dimension"
                value={editProduct.dimension}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label>Categoria:</label>
              <input
                type="text"
                name="category"
                value={editProduct.category}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label>Descrição:</label>
              <textarea
                name="description"
                value={editProduct.description}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <button type="submit">Salvar Alterações</button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            <table>
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.address}</td>
                    <td>{product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.status}</td>
                    <td>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditProduct({ ...product });
                        }}
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDelete(product.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
