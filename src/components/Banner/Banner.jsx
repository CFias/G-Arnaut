import React from "react";
import BannerImg from "../../assets/image/banner-garnaut.png";
import "./styles.css"

export const Banner = () => {
  return (
    <div className="banner-container">
      <img className="banner-img" src={BannerImg} alt="G Arnaut" />
    </div>
  );
};
