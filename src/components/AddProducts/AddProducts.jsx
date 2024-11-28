import React, { useState } from "react";
import { db, storage, auth } from "../../services/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import "./styles.css";

export const AddProducts = () => {
  const [address, setAddress] = useState(""); 
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [status, setStatus] = useState("");
  const [dimension, setDimension] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [refProduct, setRefProduct] = useState("");
  const [productType, setProductType] = useState("venda");
  const [isUploading, setIsUploading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [bedrooms, setBedrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");

  const getCurrentUser = () => {
    return auth.currentUser;
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    const previewImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImages(previewImages);
  };

  const uploadImage = async (imageFile) => {
    const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Por favor, adicione pelo menos uma imagem.");
      return;
    }

    setIsUploading(true);
    try {
      const imageFiles = Array.from(e.target.images.files);
      const imageUrls = await Promise.all(imageFiles.map(uploadImage));

      const currentUser = getCurrentUser();
      if (!currentUser) {
        alert("Você precisa estar logado para adicionar produtos.");
        return;
      }

      const userName = currentUser.displayName || "Usuário Anônimo";

      await addDoc(collection(db, "products"), {
        address, // Substituição para o campo address
        price,
        oldPrice,
        status,
        dimension,
        state,
        city,
        neighborhood,
        category,
        description,
        refProduct,
        productType,
        images: imageUrls,
        author: {
          uid: currentUser.uid,
          userName,
        },
        createdAt: new Date(),
        isFeatured,
        bedrooms,
        parkingSpaces,
      });

      alert("Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao adicionar produto.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-top">
        <h2 className="form-title">Adicionar Produto</h2>
        <img className="product-logo" src={Logo} alt="Logo" />
      </div>
      <form className="form-content" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Endereço</label>
          <input
            type="text"
            value={address} // Atualizado para address
            onChange={(e) => setAddress(e.target.value)}
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
          <label className="form-label">Preço Antigo</label>
          <input
            type="number"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Status do imóvel</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
            required
          >
            <option value="">Selecione o Status</option>
            <option value="Obra finalizada">Pronto para morar</option>
            <option value="Em obra">Em obra</option>
            <option value="Reformando">Reformando</option>
            <option value="Recém reformado">Recém reformado</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Dimensão</label>
          <input
            placeholder="m²"
            type="number"
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Cidade</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Bairro</label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
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
          <label className="form-label">Referência</label>
          <input
            type="text"
            value={refProduct}
            onChange={(e) => setRefProduct(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de Produto</label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="form-input"
            required
          >
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Imagens do Produto</label>
          <div className="image-upload-container">
            <input
              type="file"
              multiple
              accept="image/*"
              name="images"
              onChange={handleImageChange}
              id="image-input"
              className="form-input-file"
            />
            <label htmlFor="image-input" className="custom-file-input">
              Escolher Imagens
            </label>
            <div className="image-preview">
              {images.length > 0 &&
                images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`preview-${index}`}
                    className="image-thumbnail"
                  />
                ))}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Dormitórios</label>
          <input
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Vagas de Estacionamento</label>
          <input
            type="number"
            value={parkingSpaces}
            onChange={(e) => setParkingSpaces(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Destaque</label>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={() => setIsFeatured(!isFeatured)}
            className="form-input-checkbox"
          />
        </div>
        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? "Carregando..." : "Adicionar Produto"}
        </button>
      </form>
    </div>
  );
};
