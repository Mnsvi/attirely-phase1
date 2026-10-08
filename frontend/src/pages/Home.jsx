import { useEffect } from "react";
import Hero from "../components/home/Hero";
import Section1 from "../components/home/Section1";
import StartSearching from "../components/home/StartSearching";
import ColorTheory from "../components/home/ColorTheory";
import Section3 from "../components/home/Section3";
import ContactSection from "../components/home/ContactSection";
import FooterSection from "../components/home/FooterSection";
import Navbar from "../components/layout/Navbar";
import "./Home.css";

function Home() {
  useEffect(() => {
    if (window.location.hash === "#search") {
      setTimeout(() => {
        document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (window.location.hash === "#contact") {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  return (
    <div className="home-page-wrap">
      <Navbar />
      <Hero />
      <Section1 />
      <StartSearching />
      <ColorTheory />
      <Section3 />
      <ContactSection />
      <FooterSection />
    </div>
  );
}

export default Home;
