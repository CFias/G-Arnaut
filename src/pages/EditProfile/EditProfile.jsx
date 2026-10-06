import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { db, storage } from "../../services/FirebaseConfig";
import { compressImage } from "../../services/images";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import Profile from "../../assets/image/arnaut-profile.webp";
import "./styles.css";

const EditProfile = () => {
  useDocumentTitle("Editar perfil");
  const { currentUser, userName, photoURL, setUserName } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(userName || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setName(userName || ""), [userName]);

  useEffect(() => {
    if (!image) return setPreview(null);
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {};
      if (name.trim()) data.userName = name.trim();
      if (image) {
        const fileRef = ref(storage, `avatars/${currentUser.uid}`);
        await uploadBytes(fileRef, await compressImage(image));
        data.photoURL = await getDownloadURL(fileRef);
      }
      // Antes gravava "name"/"avatar", campos que o AuthContext não lia.
      await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
      if (data.userName) setUserName(data.userName);
      toast("Perfil atualizado");
      setImage(null);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      toast("Não foi possível atualizar o perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Link to="/admin" className="auth-back-link">
        <ArrowLeft size={16} /> Voltar ao painel
      </Link>
      <form className="profile-card" onSubmit={handleSave}>
        <h1>Editar perfil</h1>
        <label className="profile-avatar">
          <img src={preview || photoURL || Profile} alt="Foto do perfil" />
          <span className="profile-avatar-btn"><Camera size={16} /> Trocar foto</span>
          <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </label>
        <label className="field">
          <span className="field-label">Nome exibido</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <p className="field-hint">{currentUser?.email}</p>
        <button type="submit" className="btn btn--primary btn--lg" disabled={saving}>
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
