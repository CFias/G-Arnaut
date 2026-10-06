import React, { useState } from "react";
import { db, storage, auth } from "../../services/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import "./styles.css";

export const AddFeaturedProducts = () => {
  // Estados principais
  const [formData, setFormData] = useState({
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
    bedrooms: "",
    parkingSpaces: "",
    isFeatured: "sim", // Sempre destacado
  });
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Atualização de campos
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gerenciamento de imagens
  const handleImageChange = (e) => {
    const files = e.target.files;
    const previewImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImages(previewImages);
  };

  const uploadImage = async (imageFile) => {
    const imageRef = ref(
      storage,
      `featured_products/${Date.now()}_${imageFile.name}`
    );
    const snapshot = await uploadBytes(imageRef, imageFile);
    return getDownloadURL(snapshot.ref);
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Por favor, adicione pelo menos uma imagem.");
      return;
    }

    setIsUploading(true);
    try {
      // Upload de imagens
      const imageFiles = Array.from(e.target.images.files);
      const imageUrls = await Promise.all(imageFiles.map(uploadImage));

      // Verificar usuário atual
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Você precisa estar logado para adicionar produtos.");
        return;
      }

      // Adicionar ao Firestore
      await addDoc(collection(db, "featured_products"), {
        ...formData,
        images: imageUrls,
        author: {
          uid: currentUser.uid,
          userName: currentUser.displayName || "Usuário Anônimo",
        },
        createdAt: new Date(),
      });

      alert("Produto em destaque adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar produto em destaque:", error);
      alert("Erro ao adicionar produto.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-top">
        <h2 className="form-title">Adicionar Produto em Destaque</h2>
        <img className="product-logo" src={Logo} alt="Logo" />
      </div>
      <form className="form-content" onSubmit={handleSubmit}>
        {/* Inputs de texto */}
        {[
          { label: "Endereço", name: "address", type: "text" },
          { label: "Preço", name: "price", type: "number" },
          { label: "Preço Antigo", name: "oldPrice", type: "number" },
          { label: "Dimensão (m²)", name: "dimension", type: "number" },
          { label: "Estado", name: "state", type: "text" },
          { label: "Cidade", name: "city", type: "text" },
          { label: "Bairro", name: "neighborhood", type: "text" },
          { label: "Referência", name: "refProduct", type: "text" },
          { label: "Dormitórios", name: "bedrooms", type: "number" },
          {
            label: "Vagas de Estacionamento",
            name: "parkingSpaces",
            type: "number",
          },
        ].map(({ label, name, type }) => (
          <div className="form-group" key={name}>
            <label className="form-label">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        ))}

        {/* Select Categoria */}
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
          </select>
        </div>

        {/* Textarea Descrição */}
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

        {/* Select Status */}
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
            <option value="Em obra">Em obra</option>
            <option value="Reformando">Reformando</option>
            <option value="Recém reformado">Recém reformado</option>
          </select>
        </div>

        {/* Select Imóvel para */}
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

        {/* Upload de imagens */}
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

        {/* Botão de envio */}
        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? "Carregando..." : "Adicionar Produto em Destaque"}
        </button>
      </form>
    </div>
  );
};
