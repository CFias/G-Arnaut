import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";
import "./styles.css";
import {
  ChevronRight,
  YouTube,
  Instagram,
  Facebook,
  WhatsApp,
} from "@mui/icons-material";

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

  const latestVideo = videos[videos.length - 1];

  return (
    <div className="video-list-container">
      {latestVideo && latestVideo.videoUrl ? (
        <div className="video-card">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${extractVideoId(
              latestVideo.videoUrl
            )}`}
            title="Último Vídeo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          ></iframe>
        </div>
      ) : (
        <p className="no-videos">Não há vídeos disponíveis.</p>
      )}

      <div className="cta-container">
        <div className="cta-infos">
          <h3 className="video-list-heading">
            Inscreva-se em nosso canal no YouTube!
          </h3>
          <p className="cta-text">
            Veja os melhores imóveis com todos os detalhes em vídeo.
          </p>

          <a
            href="https://www.youtube.com/channel/SEU_CANAL_AQUI"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta"
          >
            <button className="cta-button">
              Visite nosso Canal <ChevronRight />
            </button>
          </a>

          <div className="social-icons">
            <a
              href="https://www.instagram.com/arnaut_corretor_de_imoveis?igsh=OHVjdjloOXhvdDV4"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link instagram"
            >
              <Instagram /> Instagram
            </a>
            <a
              href="https://www.facebook.com/share/1DdWamTSJw/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link facebook"
            >
              <Facebook /> Facebook
            </a>
            <a
              href="https://wa.me/7191900974"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link whatsapp"
            >
              <WhatsApp /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoList;
