import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import "./styles.css"; // Importando o arquivo CSS
import { ChevronRight } from "@mui/icons-material";

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "videos"));
        const videosArray = querySnapshot.docs.map((doc) => doc.data());
        setVideos(videosArray);
      } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
      }
    };
    fetchVideos();
  }, []);

  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/(?:www\.)?youtube\.com(?:\/(?:v|e(?:mbed)?)\/|\S*\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : "";
  };

  // Pega os três últimos vídeos
  const latestVideos = videos.slice(-3);

  return (
    <div className="video-list-container">
      <h3 className="video-list-heading">Últimos Vídeos</h3>
      {latestVideos.length > 0 ? (
        <div className="video-list">
          {latestVideos.map((video, index) => (
            <div key={index} className="video-card">
              {video.videoUrl && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractVideoId(
                    video.videoUrl
                  )}`}
                  title={`Vídeo ${index}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-iframe"
                ></iframe>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-videos">Não há vídeos disponíveis.</p>
      )}

      {/* Frase criativa e botão */}
      <div className="cta-container">
        <p className="cta-text">
          Gostou do conteúdo? Assista mais vídeos no nosso canal do YouTube!
        </p>
        <a
          href="https://www.youtube.com/channel/SEU_CANAL_AQUI"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta"
        >
          <button className="cta-button">Visite nosso Canal <ChevronRight /></button>
        </a>
      </div>
    </div>
  );
};

export default VideoList;
