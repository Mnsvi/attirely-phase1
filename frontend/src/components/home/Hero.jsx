import AttirelyMainImage from "../../assets/images/ATTIRELY.png";
import { motion } from "framer-motion";
import "./Hero.css";

function Hero() {
  const text = "ATTIRELY";

  const handleEnterClick = () => {
    document
      .getElementById("search")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero" aria-label="Hero Showcase">
      <div className="hero__media-wrapper">
        <img src={AttirelyMainImage} alt="ATTIRELY Fashion Lookbook" className="hero__image" />
        <div className="hero__overlay" />
      </div>

      <div className="hero__content">
        <motion.div
          className="hero__badge"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="hero__badge-dot" />
          MULTIMODAL AI FASHION DISCOVERY
        </motion.div>

        <h1 className="hero__maintext" aria-label="ATTIRELY">
          {text.split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15 + index * 0.1,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={
                index === 2 || index === 7
                  ? "hero__letter hero__letter--accent"
                  : "hero__letter"
              }
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        <motion.div
          className="hero__subtext"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          <span>FIND</span>
          <span className="hero__subtext-sep">•</span>
          <span>YOUR</span>
          <span className="hero__subtext-sep">•</span>
          <span className="hero__subtext--accent">STYLE</span>
        </motion.div>

        <motion.p
          className="hero__tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          Explore precision visual neural search across thousands of luxury pieces, designer silhouettes, and curated aesthetics.
        </motion.p>

        <motion.button
          type="button"
          className="hero__enter-btn"
          onClick={handleEnterClick}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.15, duration: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Enter fashion search"
        >
          <span>EXPLORE SEARCH</span>
          <span className="hero__enter-arrow">↓</span>
        </motion.button>
      </div>

      <div className="hero__scroll-indicator" onClick={handleEnterClick}>
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel" />
        </div>
        <span>SCROLL TO DISCOVER</span>
      </div>
    </section>
  );
}

export default Hero;