import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  // Começa true e só vira false depois que o Firebase confirma (ou nega)
  // a sessão pela primeira vez. Sem isso, PrivateRoute/AdminRoute viam
  // currentUser=null no instante inicial e redirecionavam para /login
  // antes do onAuthStateChanged ter a chance de responder.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.userName || null);
            setPhotoURL(data.photoURL || null);
          } else {
            setUserName(null);
            setPhotoURL(null);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setUserName(null);
          setPhotoURL(null);
        }
      } else {
        setUserName(null);
        setPhotoURL(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, userName, photoURL, setUserName, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
