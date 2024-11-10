import React, { useState } from "react";
import { db, storage, auth } from "../../services/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./styles.css";

export const AddProducts = () => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const getCurrentUser = () => {
    return auth.currentUser;
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Por favor, adicione pelo menos uma imagem.");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrls = await Promise.all(
        images.map((image) => uploadImage(image))
      );

      const currentUser = getCurrentUser(); // Captura o usuário logado
      if (!currentUser) {
        alert("Você precisa estar logado para adicionar produtos.");
        return;
      }

      const userName = currentUser.displayName || "Usuário Anônimo"; // Garantir que userName tenha um valor

      // Adicionando o produto com o autor (usuário logado)
      await addDoc(collection(db, "products"), {
        name: productName,
        price,
        category,
        description,
        images: imageUrls,
        author: {
          uid: currentUser.uid, // UID do usuário
          userName, // Agora é garantido que userName terá um valor
        },
        createdAt: new Date(),
      });

      alert("Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao adicionar produto.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImage = (image) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${image.name}`);
      uploadBytes(storageRef, image)
        .then(() => {
          getDownloadURL(storageRef)
            .then((url) => resolve(url))
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  };

  return (
    <div className="add-product-container">
      <h2 className="form-title">Adicionar Produto</h2>
      <form className="form-content" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nome do Produto</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Preço</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Categoria</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Imagens do Produto</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
          />
        </div>
        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? "Carregando..." : "Adicionar Produto"}
        </button>
      </form>
    </div>
  );
};
