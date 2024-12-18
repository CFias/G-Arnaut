import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Alteração aqui
import { addVideoToFirestore } from "../../services/FirebaseConfig"; // Função para adicionar vídeo ao Firestore

const ImportVideo = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const navigate = useNavigate();

  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/(?:www\.)?youtube\.com(?:\/(?:v|e(?:mbed)?)\/|\S*\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : "";
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setVideoUrl(url);
    const id = extractVideoId(url);
    setVideoId(id);
  };

  const handleSave = () => {
    if (videoId) {
      // Salvar o vídeo no Firestore
      addVideoToFirestore(videoUrl)
        .then(() => {
          alert("Vídeo importado com sucesso!");
          navigate("/admin"); // Redireciona para o painel admin após salvar
        })
        .catch((error) => {
          alert("Erro ao adicionar o vídeo. Tente novamente.");
          console.error(error);
        });
    } else {
      alert("Por favor, insira um link válido do YouTube.");
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Inserir link do vídeo do YouTube
        </Typography>
        <TextField
          fullWidth
          label="Link do YouTube"
          variant="outlined"
          value={videoUrl}
          onChange={handleUrlChange}
        />
        {videoId && (
          <div style={{ marginTop: 16 }}>
            <Typography variant="h6">Exibindo vídeo:</Typography>
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: 20 }}
          onClick={handleSave}
        >
          Importar Vídeo
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImportVideo;
