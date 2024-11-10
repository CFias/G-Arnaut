import React from "react";
import BannerImg from "../../assets/image/banner-garnaut.png";
import BannerMobile from "../../assets/image/banner-mobile.png";
import "./styles.css";

export const Banner = () => {
  return (
    <>
      <div className="banner-container">
        <img className="banner-img" src={BannerImg} alt="G Arnaut" />
      </div>
      <div className="banner-mobile">
        <img className="banner-img" src={BannerMobile} alt="G Arnaut" />
      </div>
    </>
  );
};
