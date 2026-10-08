import { useNavigate } from "react-router-dom";
import "./FooterSection.css";
import footerBackground from "../../assets/images/footer-background.png";

function FooterSection() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer" aria-label="Site Footer">
      <div className="footer-visual-layer">
        <img src={footerBackground} alt="Attirely Curated Fashion Banner" className="footer-bg-image" />
        <div className="footer-overlay" />
      </div>

      <div className="footer-content-wrap">
        {/* Top Newsletter & Statement */}
        <div className="footer-top-grid">
          <div className="footer-brand-pane">
            <h2 className="footer-logo">ATTIRELY</h2>
            <p className="footer-brand-desc">
              AI-powered multimodal fashion search and recommendation platform. Bridging haute editorial intuition with neural visual discovery.
            </p>
          </div>

          <div className="footer-newsletter-pane">
            <span className="newsletter-kicker">STYLING DROPS & EDITS</span>
            <h3 className="newsletter-title">Receive Curated Fashion Insights</h3>
            <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="footer-email-input"
                aria-label="Newsletter email"
              />
              <button type="submit" className="footer-submit-btn">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Links Navigation Matrix */}
        <div className="footer-links-matrix">
          <div className="footer-col">
            <h4>COLLECTIONS</h4>
            <ul>
              <li><button onClick={() => navigate("/category/Corset")}>Corsets & Bodices</button></li>
              <li><button onClick={() => navigate("/category/Skirt")}>Pleated & Midi Skirts</button></li>
              <li><button onClick={() => navigate("/category/Bag")}>Handbags & Totes</button></li>
              <li><button onClick={() => navigate("/category/Boots")}>Leather Footwear & Boots</button></li>
              <li><button onClick={() => navigate("/category/Accessories")}>Statement Accessories</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>EXPLORATION</h4>
            <ul>
              <li><button onClick={() => { navigate("/#search"); document.getElementById("search")?.scrollIntoView({ behavior: "smooth" }); }}>Text & Visual Search</button></li>
              <li><button onClick={() => navigate("/explore")}>Editorial Lookbook</button></li>
              <li><button onClick={() => navigate("/products?query=vintage")}>Vintage & Archive</button></li>
              <li><button onClick={() => navigate("/products?query=minimalist")}>Minimalist Capsule</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>SERVICES</h4>
            <ul>
              <li><span>Complimentary Styling</span></li>
              <li><span>Worldwide Express Delivery</span></li>
              <li><span>30-Day Return Guarantee</span></li>
              <li><span>Authenticity Verification</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>PLATFORM</h4>
            <ul>
              <li><span>Neural Vector Search</span></li>
              <li><span>CLIP Embeddings</span></li>
              <li><span>Privacy & Security</span></li>
              <li><span>Editorial Terms</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} ATTIRELY Studio Inc. All rights reserved. Multimodal Fashion AI.</p>
          <div className="footer-legal-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
