import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/FirebaseConfig";

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

  return (
    <div>
      <h3>Vídeos Importados</h3>
      {videos.length > 0 ? (
        videos.map((video, index) => (
          <div key={index}>
            {video.videoUrl && (
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${extractVideoId(
                  video.videoUrl
                )}`}
                title={`Vídeo ${index}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        ))
      ) : (
        <p>Não há vídeos disponíveis.</p>
      )}
    </div>
  );
};

export default VideoList;
