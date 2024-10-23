import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/FirebaseConfig";

export default function Dashboard() {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bem-vindo, {currentUser?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
