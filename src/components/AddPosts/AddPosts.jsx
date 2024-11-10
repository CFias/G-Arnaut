import React, { useState } from "react";
import { db, storage, auth } from "../../services/FirebaseConfig"; // Importando auth
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./styles.css"; // Importando o arquivo de estilos

export const AddPosts = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Função para capturar o usuário logado
  const getCurrentUser = () => {
    return auth.currentUser; // Retorna o usuário logado
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0 && !content) {
      alert("Por favor, adicione um conteúdo ou uma imagem.");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrls = await Promise.all(
        images.map((image) => uploadImage(image))
      );

      const currentUser = getCurrentUser(); // Captura o usuário logado
      if (!currentUser) {
        alert("Você precisa estar logado para adicionar publicações.");
        return;
      }

      // Adicionando a publicação com o autor (usuário logado)
      await addDoc(collection(db, "posts"), {
        title,
        content,
        category,
        images: imageUrls,
        author: {
          uid: currentUser.uid, // UID do usuário
          email: currentUser.email, // E-mail do usuário
        },
        createdAt: new Date(),
      });

      alert("Publicação adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar publicação:", error);
      alert("Erro ao adicionar publicação.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImage = (image) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `posts/${image.name}`);
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
    <div className="add-post-container">
      <h2 className="form-title">Adicionar Publicação</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Conteúdo</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-textarea"
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
          <label className="form-label">Imagens da Publicação</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
          />
        </div>
        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? "Carregando..." : "Adicionar Publicação"}
        </button>
      </form>
    </div>
  );
};
