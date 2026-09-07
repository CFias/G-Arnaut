import React, { useState } from "react";
import { db, storage, auth } from "../../services/FirebaseConfig";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import "./styles.css";
import imageCompression from "browser-image-compression";
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
  const [imageError, setImageError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const MAX_IMAGES = 10;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
    setImageError("");
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // tamanho máximo da imagem
      maxWidthOrHeight: 1920, // limite de resolução
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      return file;
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setImageError(
        `Limite de ${MAX_IMAGES} imagens atingido. Remova alguma para adicionar outra.`,
      );
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setImageError(
        `Só cabem mais ${remainingSlots} ${remainingSlots === 1 ? "imagem" : "imagens"} (limite de ${MAX_IMAGES}) — as demais não foram adicionadas.`,
      );
    } else {
      setImageError("");
    }

    const previewImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    // Acumula em vez de substituir — antes, escolher imagens uma segunda
    // vez descartava silenciosamente as que já tinham sido selecionadas.
    setImages((prev) => [...prev, ...previewImages]);
    e.target.value = ""; // permite reselecionar o mesmo arquivo depois de removê-lo
  };

  const uploadImage = async (imageFile) => {
    const compressedFile = await compressImage(imageFile);

    const imageRef = ref(
      storage,
      `products/${Date.now()}_${compressedFile.name}`,
    );

    const snapshot = await uploadBytes(imageRef, compressedFile);

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
      const imageUrls = await Promise.all(
        images.map((img) => uploadImage(img.file)),
      );

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
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setImageError("");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao adicionar produto.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="add-product-container">
      <nav className="breadcrumb-container" aria-label="breadcrumb">
        <NavLink className="breadcrumb-link" to="/admin">
          Início
        </NavLink>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Adicionar imóvel</span>
      </nav>

      <div className="add-product-top">
        <h2 className="form-title">Adicionar imóvel</h2>
        <img className="product-logo" src={Logo} alt="Logo" />
      </div>

      <form className="form-content" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">Localização</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Estado <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Cidade <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Bairro <span className="required-mark">*</span>
              </label>
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
            <div className="form-group form-group--full">
              <label className="form-label">
                Endereço <span className="required-mark">*</span>
              </label>
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
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Detalhes do imóvel</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Categoria <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Status do Imóvel <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Preço <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Dimensão <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Quartos <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Vagas de Garagem <span className="required-mark">*</span>
              </label>
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
            <div className="form-group">
              <label className="form-label">
                Referência <span className="required-mark">*</span>
              </label>
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
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Publicação</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Imóvel para <span className="required-mark">*</span>
              </label>
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
              <label className="form-label">
                Destaque <span className="required-mark">*</span>
              </label>
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
            <div className="form-group">
              <label className="form-label">Link do Vídeo (YouTube)</label>
              <input
                type="url"
                name="videoLink"
                value={formData.videoLink}
                placeholder="https://youtube.com/..."
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Descrição</h3>
          <div className="form-group">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Descreva os principais diferenciais do imóvel..."
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Imagens do imóvel</h3>
          <div className="form-group">
            <div className="image-upload-header">
              <label className="form-label">
                Fotos <span className="required-mark">*</span>
              </label>
              <span
                className={`image-counter ${images.length >= MAX_IMAGES ? "at-limit" : ""}`}
              >
                {images.length} / {MAX_IMAGES}
              </span>
            </div>

            <div
              className={`image-dropzone ${images.length >= MAX_IMAGES ? "disabled" : ""}`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                name="images"
                onChange={handleImageChange}
                id="image-input"
                className="form-input-file"
                disabled={images.length >= MAX_IMAGES}
              />
              <label htmlFor="image-input" className="image-dropzone-label">
                <span className="image-dropzone-title">
                  {images.length >= MAX_IMAGES
                    ? "Limite de imagens atingido"
                    : "Clique para escolher imagens"}
                </span>
                <span className="image-dropzone-hint">
                  JPG ou PNG · até {MAX_IMAGES} fotos · a primeira vira a capa
                  do anúncio
                </span>
              </label>
            </div>

            {imageError && <p className="image-error">{imageError}</p>}

            {images.length > 0 && (
              <div className="image-preview">
                {images.map((image, index) => (
                  <div key={image.preview} className="image-preview-item">
                    {index === 0 && (
                      <span className="image-cover-badge">Capa</span>
                    )}
                    <img
                      src={image.preview}
                      alt={`preview-${index}`}
                      className="image-thumbnail"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => removeImage(index)}
                      aria-label="Remover imagem"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? "Carregando..." : "Adicionar Produto"}
        </button>
      </form>
    </div>
  );
};
