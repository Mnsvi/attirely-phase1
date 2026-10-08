import "./ExploreMore.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import FooterSection from "../components/home/FooterSection";

function ExploreMore() {
  const navigate = useNavigate();

  return (
    <div className="explore-page-wrapper">
      <Navbar />

      <main className="explore-page">
        <div className="explore-header">
          <span className="explore-kicker">INTERACTIVE CAPSULE</span>
          <h1 className="explore-title">THE EDITORIAL ANATOMY</h1>
          <p className="explore-subtitle">
            Click any styled garment to explore curated pieces and neural recommendations.
          </p>
        </div>

        <div className="explore-container">
          {/* MODEL */}
          <div className="model-wrap">
            <img
              src="/images/model.jpg"
              className="explore-image model"
              alt="Editorial Haute Model"
            />
          </div>

          {/* CORSET - CLICKABLE */}
          <div
            className="clickable-item corset"
            onClick={() => navigate("/category/Corset")}
            role="button"
            tabIndex={0}
            aria-label="Explore Corsets"
          >
            <div className="item-card-inner">
              <img src="/images/corset.jpg" alt="Corset" />
              <div className="item-badge">
                <span className="item-tag">CORSET</span>
                <span className="item-action">SHOP →</span>
              </div>
            </div>
          </div>

          {/* ACCESSORIES - CLICKABLE */}
          <div
            className="clickable-item accessories"
            onClick={() => navigate("/category/Accessories")}
            role="button"
            tabIndex={0}
            aria-label="Explore Accessories"
          >
            <div className="item-card-inner">
              <img src="/images/accessories.jpg" alt="Accessories" />
              <div className="item-badge">
                <span className="item-tag">ACCESSORIES</span>
                <span className="item-action">SHOP →</span>
              </div>
            </div>
          </div>

          {/* PURSE - CLICKABLE */}
          <div
            className="clickable-item purse"
            onClick={() => navigate("/category/Bag")}
            role="button"
            tabIndex={0}
            aria-label="Explore Bags"
          >
            <div className="item-card-inner">
              <img src="/images/purse.jpg" alt="Bag" />
              <div className="item-badge">
                <span className="item-tag">HANDBAG</span>
                <span className="item-action">SHOP →</span>
              </div>
            </div>
          </div>

          {/* SKIRT - CLICKABLE */}
          <div
            className="clickable-item skirt"
            onClick={() => navigate("/category/Skirt")}
            role="button"
            tabIndex={0}
            aria-label="Explore Skirts"
          >
            <div className="item-card-inner">
              <img src="/images/skirts.jpg" alt="Skirt" />
              <div className="item-badge">
                <span className="item-tag">SKIRT</span>
                <span className="item-action">SHOP →</span>
              </div>
            </div>
          </div>

          {/* BOOTS - CLICKABLE */}
          <div
            className="clickable-item boots"
            onClick={() => navigate("/category/Boots")}
            role="button"
            tabIndex={0}
            aria-label="Explore Boots"
          >
            <div className="item-card-inner">
              <img src="/images/boots.jpg" alt="Boots" />
              <div className="item-badge">
                <span className="item-tag">BOOTS</span>
                <span className="item-action">SHOP →</span>
              </div>
            </div>
          </div>

          {/* CONNECTOR LINES */}
          <div className="line corset-line" />
          <div className="line accessories-line" />
          <div className="line purse-line" />
          <div className="line skirt-line" />
          <div className="line boots-line" />
        </div>
      </main>

      <FooterSection />
    </div>
  );
}

export default ExploreMore;