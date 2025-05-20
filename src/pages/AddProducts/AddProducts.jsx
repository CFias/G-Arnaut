import React, { useState } from "react";
import { db, storage, auth } from "../../services/FirebaseConfig";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import "./styles.css";
import { NavLink } from "react-router-dom";

export const AddProducts = () => {
  const [formData, setFormData] = useState({
    address: "",
    price: "",
    status: "",
    dimension: "",
    state: "",
    city: "",
    neighborhood: "",
    category: "",
    description: "",
    refProduct: "",
    productType: "venda",
    bedrooms: "",
    parkingSpaces: "",
    isFeatured: "não",
    videoLink: "",
  });
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    return getDownloadURL(snapshot.ref);
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

      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Você precisa estar logado para adicionar produtos.");
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userName = currentUser.displayName || "Usuário Anônimo";
      let photoURL = currentUser.photoURL || "";

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userName = userData.userName || userName;
        photoURL = userData.photoURL || photoURL;
      }

      await addDoc(collection(db, "products"), {
        ...formData,
        images: imageUrls,
        author: {
          uid: currentUser.uid,
          userName,
          photoURL,
        },
        createdAt: new Date(),
      });

      alert("Produto adicionado com sucesso!");
      setFormData({
        address: "",
        price: "",
        status: "",
        dimension: "",
        state: "",
        city: "",
        neighborhood: "",
        category: "",
        description: "",
        refProduct: "",
        productType: "venda",
        bedrooms: "",
        parkingSpaces: "",
        isFeatured: "não",
        videoLink: "",
      });
      setImages([]);
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao adicionar produto.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="add-product-container">
      <NavLink className="access-back" to="/admin">
        Voltar
      </NavLink>
      <div className="add-product-top">
        <h2 className="form-title">Adicionar imóvel</h2>
        <img className="product-logo" src={Logo} alt="Logo" />
      </div>
      <form className="form-content" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Estado</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              placeholder="Ex: BA"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              placeholder="Ex: Rua das Flores, 123"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Bairro</label>
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              placeholder="Ex: Pituba"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              placeholder="Ex: Salvador"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Preço</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              placeholder="Ex: R$ 350.000,00"
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
                const numericValue = parseFloat(rawValue) / 100;

                const formattedValue = numericValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                setFormData({ ...formData, price: formattedValue });
              }}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dimensão</label>
            <input
              type="text"
              name="dimension"
              value={formData.dimension}
              placeholder="Ex: 200m²"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Referência</label>
            <input
              type="text"
              name="refProduct"
              value={formData.refProduct}
              placeholder="Ex: COD123"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quartos</label>
            <input
              type="text"
              name="bedrooms"
              value={formData.bedrooms}
              placeholder="Ex: 3"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vagas de Garagem</label>
            <input
              type="text"
              name="parkingSpaces"
              value={formData.parkingSpaces}
              placeholder="Ex: 2"
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
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
            <label className="form-label">Link do Vídeo (YouTube)</label>
            <input
              type="url"
              name="videoLink"
              value={formData.videoLink}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status do Imóvel</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
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
              value={formData.productType}
              onChange={handleInputChange}
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
              value={formData.isFeatured}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="não">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Imagens do Imóvel</label>
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
              {images.map((image, index) => (
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
        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? "Carregando..." : "Adicionar Produto"}
        </button>
      </form>
    </div>
  );
};
