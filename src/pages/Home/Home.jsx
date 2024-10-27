import React from "react";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { Banner } from "../../components/Banner/Banner";

export const Home = () => {
  return (
    <>
      <Navbar />
      <main className="home-container">
        <Banner />
      </main>
      <Footer />
    </>
  );
};
