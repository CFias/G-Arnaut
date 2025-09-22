import React from "react";
import PhoneIcon from "@mui/icons-material/Phone"; // ícone opcional do MUI

const CallButton = () => {
    const handleCallClick = (e) => {
        e.preventDefault();

        // Dispara o evento de conversão para Google Ads
        if (typeof window.gtag === "function") {
            window.gtag("event", "conversion", {
                send_to: "AW-16519300622/7BEFCO_5wYsbEI6MgsU9", // ID da conversão de ligação
            });
        }

        // Pequeno delay para garantir que o evento seja enviado antes da navegação
        setTimeout(() => {
            window.location.href = "tel:+5571991900974";
        }, 400);
    };

    return (
        <button
            onClick={handleCallClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#25D366",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
            }}
        >
            <PhoneIcon /> Ligar Agora
        </button>
    );
};

export default CallButton;
