import { useState, useRef } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import "./ProductCard.css";

gsap.registerPlugin(TextPlugin);

function ProductCard({ data, filteredProducts, total }) {
  const products = data?.products || [];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [wishlisted, setWishlisted] = useState({});
  const styleNoteRefs = useRef([]);

  const toggleWishlist = (e, index) => {
    e.stopPropagation();
    setWishlisted((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleMouseEnter = (index, styleNote) => {
    setHoveredIndex(index);
    const element = styleNoteRefs.current[index];
    if (!element || !styleNote) return;

    gsap.killTweensOf(element);
    gsap.set(element, { text: "" });
    gsap.to(element, {
      duration: Math.min(styleNote.length * 0.018, 1.2),
      text: styleNote,
      ease: "none",
    });
  };

  const handleMouseLeave = (index) => {
    setHoveredIndex(null);
    const element = styleNoteRefs.current[index];
    if (!element) return;

    gsap.killTweensOf(element);
    gsap.to(element, {
      duration: 0.15,
      text: "",
      ease: "none",
    });
  };

  if (!products.length) {
    return (
      <div className="no-products-message">
        <h3>No matching garments discovered</h3>
        <p>Try broadening your query or clearing active filters.</p>
      </div>
    );
  }

  return (
    <>
      {products.map((product, index) => {
        const isWish = !!wishlisted[index];
        const isHovered = hoveredIndex === index;
        const discountPrice = product.discounted_price ?? product.price;
        const hasDiscount = product.discounted_price && product.discounted_price < product.price;

        return (
          <article
            className={`product-card ${isHovered ? "product-card--hovered" : ""}`}
            key={product.id || index}
            onMouseEnter={() => handleMouseEnter(index, product.style_note)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            {/* Image Container */}
            <div className="product-image-wrap">
              {product.base_colour && (
                <span className="product-color-badge">{product.base_colour}</span>
              )}

              <button
                type="button"
                className={`product-wishlist-btn ${isWish ? "product-wishlist-btn--active" : ""}`}
                onClick={(e) => toggleWishlist(e, index)}
                aria-label="Save to Wishlist"
              >
                {isWish ? "♥" : "♡"}
              </button>

              <img
                src={product.image_url}
                alt={product.product_display_name || "Fashion garment"}
                className="product-main-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/corset.jpg";
                }}
              />

              {/* Style Note Floating Drawer */}
              {product.style_note && (
                <div className={`style-note-container ${isHovered ? "style-note-container--visible" : ""}`}>
                  <div className="style-note-header">
                    <span className="style-note-pill">AI STYLING ADVICE</span>
                  </div>
                  <p
                    className="style-note"
                    ref={(el) => {
                      styleNoteRefs.current[index] = el;
                    }}
                  />
                </div>
              )}
            </div>

            {/* Product Meta Info */}
            <div className="about-product">
              <div className="brand-text">
                <span className="brand-name">{product.brand_name || "Designer Studio"}</span>
                {product.season && <span className="product-season">{product.season}</span>}
              </div>

              <h3 className="product-name" title={product.product_display_name}>
                {product.product_display_name || "Curated Fashion Item"}
              </h3>

              <div className="product-price">
                {hasDiscount && (
                  <span className="actual-price">INR {product.price?.toLocaleString()}</span>
                )}
                <span className="discounted-price">
                  INR {discountPrice?.toLocaleString()}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}

export default ProductCard;
