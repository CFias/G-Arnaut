import React from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export const TypesProducts = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Apartamento",
      image: "https://via.placeholder.com/300x200?text=Apartamento",
    },
    { name: "Casa", image: "https://via.placeholder.com/300x200?text=Casa" },
    {
      name: "Fazenda",
      image: "https://via.placeholder.com/300x200?text=Fazenda",
    },
    { name: "Sítio", image: "https://via.placeholder.com/300x200?text=Sítio" },
    {
      name: "Terreno",
      image: "https://via.placeholder.com/300x200?text=Terreno",
    },
    {
      name: "Galpão",
      image: "https://via.placeholder.com/300x200?text=Galpão",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const handleCategoryClick = (category) => {
    navigate(`/properties?category=${category}`);
  };

  return (
    <div className="types-products-container">
      <h2 className="types-products-title">Escolha uma Categoria</h2>
      <Slider {...settings}>
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-card"
            onClick={() => handleCategoryClick(category.name)}
          >
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
            />
            <h3 className="category-name">{category.name}</h3>
          </div>
        ))}
      </Slider>
    </div>
  );
};
