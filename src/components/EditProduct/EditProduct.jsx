import React, { useState, useEffect } from "react";
import { db, storage } from "../../services/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom"; // Substituindo useHistory por useNavigate
import Logo from "../../assets/image/garnaut-gray-logo.png";
import "./styles.css";

export const EditProduct = ({ match }) => {
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
    isFeatured: "não", // Inicializando com "não"
  });
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [product, setProduct] = useState(null);

  const navigate = useNavigate(); // Usando useNavigate
  const productId = match.params.id; // Assuming the product ID is passed in the URL

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }

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

      const updatedProduct = { ...formData, images: imageUrls };

      await updateDoc(doc(db, "products", productId), updatedProduct);

      alert("Produto editado com sucesso!");
      navigate("/admin"); // Usando navigate para redirecionar após a edição
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      alert("Erro ao editar produto.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentProduct) return <div>Carregando produto...</div>;

  return (
    <div className="add-product-container">
      <div className="add-product-top">
        <h2 className="form-title">Editar Produto</h2>
        <img className="product-logo" src={Logo} alt="Logo" />
      </div>
      <form className="form-content" onSubmit={handleSubmit}>
        {/* Renderizando os campos do formulário com base nos dados do produto */}
        {Object.keys(formData).map(
          (key) =>
            key !== "images" && (
              <div className="form-group" key={key}>
                <label className="form-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            )
        )}
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
          {isUploading ? "Carregando..." : "Salvar Produto"}
        </button>
      </form>
    </div>
  );
};
