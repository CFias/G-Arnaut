import React, { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../../services/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditProfile = () => {
  const { currentUser, userName, setUserName } = useAuth();
  const [newName, setNewName] = useState(userName || "");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(image);
    } else {
      setPreviewUrl(null);
    }
  }, [image]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", currentUser.uid);

      let photoURL = null;

      if (image) {
        const storageRef = ref(storage, `avatars/${currentUser.uid}`);
        await uploadBytes(storageRef, image);
        photoURL = await getDownloadURL(storageRef);
      }

      const updatedData = {
        ...(newName && { name: newName }),
        ...(photoURL && { avatar: photoURL }),
      };

      await updateDoc(userRef, updatedData);

      if (newName) setUserName(newName);

      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h5" mb={3}>
        Editar Perfil
      </Typography>

      <Stack spacing={3}>
        <Avatar
          src={previewUrl}
          alt="Avatar"
          sx={{ width: 120, height: 120, mx: "auto" }}
        />
        <Button variant="contained" component="label">
          Selecionar Foto
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Button>

        <TextField
          label="Nome de usuário"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Salvar"}
        </Button>
      </Stack>
    </Box>
  );
};

export default EditProfile;
