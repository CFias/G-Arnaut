import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./styles.css";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!Cookies.get("cookieConsent")) setShow(true);
  }, []);

  const accept = (value) => {
    Cookies.set("cookieConsent", value, { expires: 365, sameSite: "Lax" });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <p>
        Usamos cookies para melhorar sua experiência e medir o desempenho do site. Você pode aceitar todos ou usar
        apenas os necessários.
      </p>
      <div className="cookie-buttons">
        <button type="button" className="btn btn--outline btn--sm" onClick={() => accept("necessary")}>
          Só os necessários
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => accept("all")}>
          Aceitar todos
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
