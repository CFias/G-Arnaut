import React, { useEffect, useState } from "react";
import { db } from "../../services/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./styles.css"; // Add necessary styles
import { Navbar } from "../../components/Navbar/Navbar";

const RentalsPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const q = query(
        collection(db, "products"),
        where("productType", "==", "aluguel") // Filtering for rental properties
      );
      const querySnapshot = await getDocs(q);

      const propertiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching rental properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return <p>Loading properties...</p>;
  }

  return (
    <>
      <Navbar />
      <div className="rentals-page-container">
        <h2>Para locação</h2>
        <div className="properties-list">
          {properties.length === 0 ? (
            <p>Nenhum imóvel para locação.</p>
          ) : (
            properties.map((property) => (
              <div key={property.id} className="property-card">
                <img
                  src={property.images[0]}
                  alt={property.address}
                  className="property-image"
                />
                <div className="property-details">
                  <h3>{property.address}</h3>
                  <p>{property.description}</p>
                  <p>Price: {property.price} R$</p>
                  <Link to={`/property/${property.id}`} className="view-more">
                    View more
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default RentalsPage;
