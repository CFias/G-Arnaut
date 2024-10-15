import "./App.css";
import { Navbar } from "./components/Navbar/Navbar";

// Imports Libs
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
