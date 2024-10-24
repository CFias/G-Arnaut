import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/FirebaseConfig"; // Import your Firebase auth instance

const useAuthentication = () => {
  const [user, setUser] = useState(undefined); // State to hold user info
  const [loading, setLoading] = useState(true); // State to manage loading status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user state
      setLoading(false); // Set loading to false when user state changes
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return { user, loading }; // Return user and loading state
};

export default useAuthentication;
