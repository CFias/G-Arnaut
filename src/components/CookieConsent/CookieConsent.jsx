// components/CookieConsent/CookieConsent.jsx
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./styles.css";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    Cookies.set("cookieConsent", "all", { expires: 365 });
    setShow(false);
  };

  const handleAcceptNecessary = () => {
    Cookies.set("cookieConsent", "necessary", { expires: 365 });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-consent">
      <p>
        Usamos cookies para melhorar sua experiência. Você pode aceitar todos ou
        utilizar apenas os necessários.
      </p>
      <div className="cookie-buttons">
        <button className="btn-necessary" onClick={handleAcceptNecessary}>
          Usar somente os necessários
        </button>
        <button className="btn-accept" onClick={handleAcceptAll}>
          Aceitar todos
        </button>
      </div>
    </div>
  );
};
