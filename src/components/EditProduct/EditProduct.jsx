import React, { useState, useEffect } from "react";
import { db, storage } from "../../services/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import imageCompression from "browser-image-compression";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import "./styles.css";

const emptyForm = {
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
};

export const EditProduct = () => {
  // useParams() é o hook correto no React Router v6/v7 — o componente
  // era montado com "element={<EditProduct />}", que nunca passa uma
  // prop "match" (isso é API do React Router v5). O acesso a
  // match.params.id quebrava o componente assim que ele renderizava.
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]); // URLs já salvas
  const [newImages, setNewImages] = useState([]); // { file, preview }
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Preenche o formulário com os dados reais do imóvel — antes
          // isso nunca acontecia e a edição sempre partia de campos vazios.
          setFormData({ ...emptyForm, ...data });
          setExistingImages(data.images || []);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        setNotFound(true);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const compressImage = async (file) => {
    try {
      return await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      return file;
    }
  };

  const uploadImage = async (imageFile) => {
    const compressed = await compressImage(imageFile);
    const imageRef = ref(storage, `products/${Date.now()}_${compressed.name}`);
    const snapshot = await uploadBytes(imageRef, compressed);
    return getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImages.length === 0) {
      alert("O imóvel precisa de pelo menos uma imagem.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        newImages.map((img) => uploadImage(img.file))
      );

      await updateDoc(doc(db, "products", productId), {
        ...formData,
        images: [...existingImages, ...uploadedUrls],
        updatedAt: new Date(),
      });

      alert("Produto editado com sucesso!");
      navigate("/admin");
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      alert("Erro ao editar produto.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProduct) return <div className="add-product-container">Carregando produto...</div>;
  if (notFound) return <div className="add-product-container">Produto não encontrado.</div>;

  return (
    <div className="add-product-container">
      <NavLink className="access-back" to="/admin">
        Voltar
      </NavLink>
      <div className="add-product-top">
        <h2 className="form-title">Editar imóvel</h2>
        <img className="product-logo" src={Logo} alt="Logo" />
      </div>
      <form className="form-content" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Estado</label>
            <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Bairro</label>
            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Preço</label>
            <input type="text" name="price" value={formData.price} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Dimensão</label>
            <input type="text" name="dimension" value={formData.dimension} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Referência</label>
            <input type="text" name="refProduct" value={formData.refProduct} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Quartos</label>
            <input type="text" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Vagas de Garagem</label>
            <input type="text" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleInputChange} className="form-input" required />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="form-input" required>
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
            <input type="url" name="videoLink" value={formData.videoLink} onChange={handleInputChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Status do Imóvel</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="form-input" required>
              <option value="">Selecione o Status</option>
              <option value="Obra finalizada">Pronto para morar</option>
              <option value="Lançamento">Lançamento</option>
              <option value="Reformando">Reformando</option>
              <option value="Recém reformado">Recém reformado</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Imóvel para:</label>
            <select name="productType" value={formData.productType} onChange={handleInputChange} className="form-input" required>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Destaque</label>
            <select name="isFeatured" value={formData.isFeatured} onChange={handleInputChange} className="form-input" required>
              <option value="não">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-textarea" required />
        </div>

        <div className="form-group">
          <label className="form-label">Imagens atuais</label>
          <div className="image-preview">
            {existingImages.map((url, index) => (
              <div key={url} className="image-preview-item">
                <img src={url} alt={`Imagem ${index + 1}`} className="image-thumbnail" loading="lazy" />
                <button type="button" className="remove-image-button" onClick={() => handleRemoveExistingImage(index)}>
                  ✕
                </button>
              </div>
            ))}
            {existingImages.length === 0 && <p>Nenhuma imagem atual — adicione pelo menos uma abaixo.</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Adicionar novas imagens</label>
          <div className="image-upload-container">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              id="image-input"
              className="form-input-file"
            />
            <label htmlFor="image-input" className="custom-file-input">
              Escolher Imagens
            </label>
            <div className="image-preview">
              {newImages.map((image, index) => (
                <div key={image.preview} className="image-preview-item">
                  <img src={image.preview} alt={`Nova imagem ${index + 1}`} className="image-thumbnail" />
                  <button type="button" className="remove-image-button" onClick={() => removeNewImage(index)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? "Salvando..." : "Salvar Produto"}
        </button>
      </form>
    </div>
  );
};
