// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/FirebaseConfig"; // Importando db corretamente
import { doc, getDoc } from "firebase/firestore"; // Importando métodos do Firestore

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Se o usuário estiver autenticado, busque o nome do usuário
        const userDoc = await getDoc(doc(db, "users", user.uid)); // Ajuste o caminho da coleção conforme sua estrutura
        if (userDoc.exists()) {
          // Verifica se o documento existe
          setCurrentUser({ ...user, userName: userDoc.data().username }); // Supondo que o campo username exista no Firestore
        } else {
          setCurrentUser({ ...user, userName: "Usuário sem nome" }); // Lida com a ausência de nome
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, loading }; // Adicione o estado de carregamento aqui

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
