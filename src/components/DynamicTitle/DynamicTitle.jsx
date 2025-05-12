import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DynamicTitle = () => {
  const location = useLocation(); // Obtém o caminho da URL

  useEffect(() => {
    // Alteração do título com base no caminho atual da URL
    if (location.pathname === "/") {
      document.title = "Página Inicial - G Arnaut Corretor";
    } else if (location.pathname === "/Sale-Products") {
      document.title = "Vendas - G Arnaut Corretor";
    } else if (location.pathname === "/Rent-Products") {
      document.title = "Aluguel - G Arnaut Corretor";
    } else if (location.pathname === "/about") {
      document.title = "Sobre o Corretor - G Arnaut Corretor";
    } else if (location.pathname === "/admin") {
      document.title = "Administração - G Arnaut Corretor";     
    } else {
      document.title = "G Arnaut Corretor"; // Título padrão
    }
  }, [location]); // Reexecução quando o caminho mudar

  return null; // Não precisa renderizar nada
};

export default DynamicTitle;
