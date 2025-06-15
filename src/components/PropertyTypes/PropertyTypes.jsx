import React from "react";

const propertyTypes = [
  { label: "Apartamento", image: "/assets/tipos/apartamento.jpg" },
  { label: "Casa", image: "/assets/tipos/casa.jpg" },
  { label: "Galpão", image: "/assets/tipos/galpao.jpg" },
  { label: "Sítio", image: "/assets/tipos/sitio.jpg" },
  { label: "Sala Comercial", image: "/assets/tipos/sala-comercial.jpg" },
];

const PropertyTypes = () => {
  return (
    <section className="w-full py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Tipos de Imóveis</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {propertyTypes.map((type, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer bg-white"
            >
              <img
                src={type.image}
                alt={type.label}
                className="w-full h-32 object-cover"
              />
              <div className="text-center py-3 px-2">
                <p className="font-medium text-sm">{type.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyTypes;
