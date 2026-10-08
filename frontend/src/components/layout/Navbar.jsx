import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchClick = () => {
    setMobileMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#search");
    }
  };

  const handleContactClick = () => {
    setMobileMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#contact");
    }
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryNav = (cat) => {
    setMobileMenuOpen(false);
    navigate(`/category/${cat}`);
  };

  return (
    <>
      {/* Top Editorial Announcement Ribbon */}
      <aside className="announcement-bar" aria-label="Announcement">
        <div className="announcement-content">
          <span className="announcement-tag">AI MULTIMODAL</span>
          <span className="announcement-text">Curated fashion discovery with semantic neural search & styling</span>
          <span className="announcement-link" onClick={() => navigate("/explore")}>Explore Lookbook →</span>
        </div>
      </aside>

      <header className={`category-header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="header-inner">
          {/* Left Navigation Links */}
          <nav className="nav-links desktop-only" aria-label="Main Navigation">
            <button className="nav-link" onClick={handleHomeClick}>
              Home
            </button>
            <div className="nav-dropdown-wrapper">
              <button className="nav-link nav-link--has-dropdown" onClick={() => handleCategoryNav("Corset")}>
                Categories <span className="dropdown-caret">▾</span>
              </button>
              <div className="nav-dropdown-menu">
                <button className="dropdown-item" onClick={() => handleCategoryNav("Corset")}>Corsets</button>
                <button className="dropdown-item" onClick={() => handleCategoryNav("Skirt")}>Skirts</button>
                <button className="dropdown-item" onClick={() => handleCategoryNav("Bag")}>Handbags</button>
                <button className="dropdown-item" onClick={() => handleCategoryNav("Boots")}>Boots & Shoes</button>
                <button className="dropdown-item" onClick={() => handleCategoryNav("Accessories")}>Accessories</button>
              </div>
            </div>
            <button className="nav-link" onClick={() => navigate("/explore")}>
              Lookbook
            </button>
            <button className="nav-link" onClick={handleSearchClick}>
              AI Search
            </button>
            <button className="nav-link" onClick={handleContactClick}>
              Atelier Concierge
            </button>
          </nav>

          {/* Centered Brand Logo */}
          <div
            className="brand-logo"
            onClick={handleHomeClick}
            role="button"
            tabIndex={0}
            aria-label="ATTIRELY Home"
          >
            <span className="brand-logo-text">ATTIRELY</span>
            <span className="brand-logo-sub">STUDIO</span>
          </div>

          {/* Right Action Icons */}
          <div className="header-icons">
            {/* SEARCH */}
            <button
              className="nav-icon"
              onClick={handleSearchClick}
              title="Search fashion items"
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <line x1="16" y1="16" x2="21" y2="21" />
              </svg>
              <span className="visually-hidden">Search</span>
            </button>

            {/* HOME */}
            <button
              className="nav-icon desktop-only"
              onClick={handleHomeClick}
              title="Return to Home"
              aria-label="Home"
            >
              <svg viewBox="0 0 24 24">
                <path d="M3 11.5L12 4l9 7.5" />
                <path d="M5.5 10.5V20h13v-9.5" />
                <path d="M9.5 20v-5.5h5V20" />
              </svg>
              <span className="visually-hidden">Home</span>
            </button>

            {/* BAG */}
            <button
              className="nav-icon bag-icon-btn"
              onClick={() => setBagOpen(!bagOpen)}
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <svg viewBox="0 0 24 24">
                <path d="M6 8h12l1 12H5L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="bag-badge">3</span>
              <span className="visually-hidden">Bag</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="nav-icon mobile-toggle mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <nav className="mobile-menu" aria-label="Mobile Navigation">
            <button className="mobile-nav-link" onClick={handleHomeClick}>Home</button>
            <button className="mobile-nav-link" onClick={handleSearchClick}>AI Search</button>
            <button className="mobile-nav-link" onClick={handleContactClick}>Atelier Concierge</button>
            <div className="mobile-categories-group">
              <span className="mobile-cat-header">CATEGORIES</span>
              <div className="mobile-cat-grid">
                <button onClick={() => handleCategoryNav("Corset")}>Corsets</button>
                <button onClick={() => handleCategoryNav("Skirt")}>Skirts</button>
                <button onClick={() => handleCategoryNav("Bag")}>Handbags</button>
                <button onClick={() => handleCategoryNav("Boots")}>Boots</button>
                <button onClick={() => handleCategoryNav("Accessories")}>Accessories</button>
              </div>
            </div>
            <button className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); navigate("/explore"); }}>
              Lookbook
            </button>
          </nav>
        )}
      </header>

      {/* Quick Bag Preview Drawer */}
      {bagOpen && (
        <>
          <div className="bag-overlay" onClick={() => setBagOpen(false)} />
          <aside className="bag-drawer" aria-label="Shopping Bag Drawer">
            <div className="bag-drawer-header">
              <h3>YOUR CURATED BAG</h3>
              <button className="bag-close-btn" onClick={() => setBagOpen(false)}>×</button>
            </div>
            <div className="bag-drawer-items">
              <div className="bag-item-card">
                <div className="bag-item-img-placeholder">
                  <img src="/images/corset.jpg" alt="Denim Corset" />
                </div>
                <div className="bag-item-details">
                  <h4>Structured Denim Corset</h4>
                  <p className="bag-item-meta">Size: M • Wash: Ink Blue</p>
                  <p className="bag-item-price">INR 2,499</p>
                </div>
              </div>
              <div className="bag-item-card">
                <div className="bag-item-img-placeholder">
                  <img src="/images/boots.jpg" alt="Leather Boots" />
                </div>
                <div className="bag-item-details">
                  <h4>Knee-High Leather Boots</h4>
                  <p className="bag-item-meta">Size: 38 • Black</p>
                  <p className="bag-item-price">INR 4,999</p>
                </div>
              </div>
            </div>
            <div className="bag-drawer-footer">
              <div className="bag-subtotal">
                <span>Subtotal</span>
                <strong>INR 7,498</strong>
              </div>
              <p className="bag-note">Free shipping & complimentary styling applied</p>
              <button
                className="bag-checkout-btn"
                onClick={() => {
                  setBagOpen(false);
                  navigate("/products?query=corset");
                }}
              >
                DISCOVER MORE PIECES
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export default Navbar;