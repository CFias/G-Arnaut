import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Cria o contexto
const AuthContext = createContext();

// Provedor do contexto de autenticação
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState(null); // Nome do usuário

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().userName);
          } else {
            setUserName(null);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setUserName(null);
        }
      } else {
        setUserName(null);
      }
    });

    return unsubscribe;
  }, []);

  // Exponha setUserName aqui para poder atualizá-lo em qualquer lugar
  return (
    <AuthContext.Provider value={{ currentUser, userName, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir o contexto
export function useAuth() {
  return useContext(AuthContext);
}
