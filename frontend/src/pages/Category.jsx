import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import FooterSection from "../components/home/FooterSection";
import "./Category.css";

const CATEGORY_QUERIES = {
  Boots: "boots",
  Corset: "corset",
  Skirt: "skirts",
  Bag: "handbag",
  Accessories: "fashion accessories",
};

function Category() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [wishlisted, setWishlisted] = useState({});

  const category =
    categoryName?.charAt(0).toUpperCase() +
    categoryName?.slice(1).toLowerCase();

  const toggleWishlist = (id) => {
    setWishlisted((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const query = CATEGORY_QUERIES[category] || category;

        const response = await fetch("http://127.0.0.1:8000/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query_text: query,
            top_k: 30,
            apply_rerank: false,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        console.log("Backend response:", data);

        setProducts(data.products || []);
        const countResponse = await fetch(
          `http://127.0.0.1:8000/category-count/${encodeURIComponent(category)}`
        );

        if (countResponse.ok) {
          const countData = await countResponse.json();
          console.log("Category count:", countData);
          setTotalCount(countData.count);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="category-page">
      <Navbar />

      {/* ================= CATEGORY HEADER ================= */}
      <header className="category-top">
        <div className="category-header-wrap">
          <div className="category-breadcrumb">
            <span onClick={() => navigate("/")}>Home</span>
            <span className="breadcrumb-sep">/</span>
            <span>Collections</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{category}</span>
          </div>

          <div className="category-title-row">
            <div className="category-info">
              <h1 className="category-heading">{category} Collection</h1>
              <p className="category-count-label">
                {loading ? "Discovering curated pieces..." : `${totalCount || products.length} statement pieces discovered`}
              </p>
            </div>

            <button
              className="category-filter-btn"
              onClick={() => navigate(`/products?query=${encodeURIComponent(category)}`)}
            >
              <span>Explore Full AI Search</span>
              <span className="category-filter-arrow">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= PRODUCTS ================= */}
      <main className="product-section">
        {loading && (
          <div className="category-loading-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="category-skeleton-card">
                <div className="category-skeleton-img" />
                <div className="category-skeleton-text" />
                <div className="category-skeleton-sub" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="category-error-state">
            <h3>Unable to retrieve collection</h3>
            <p>{error}</p>
            <button
              className="category-retry-btn"
              onClick={() => navigate(`/products?query=${encodeURIComponent(category)}`)}
            >
              SEARCH VIA CLOUD ENGINE
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="category-empty-state">
            <h3>No matching products found in {category}</h3>
            <p>Explore our full catalogue through multimodal semantic search.</p>
            <button
              className="category-retry-btn"
              onClick={() => navigate("/")}
            >
              RETURN TO HOME
            </button>
          </div>
        )}

        <div className="category-product-grid">
          {products.map((product) => {
            const isWish = !!wishlisted[product.id];
            const price = product.discounted_price || product.price;

            return (
              <article className="cat-product-card" key={product.id}>
                {/* IMAGE */}
                <div className="cat-product-image-wrapper">
                  <button
                    type="button"
                    className={`cat-wishlist-btn ${isWish ? "cat-wishlist-btn--active" : ""}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Wishlist"
                  >
                    {isWish ? "♥" : "♡"}
                  </button>

                  <img
                    src={product.image_url}
                    alt={product.product_display_name}
                    className="cat-product-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/corset.jpg";
                    }}
                  />
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="cat-product-info">
                  <div className="cat-product-topline">
                    <span className="cat-product-brand">
                      {product.brand_name || "Designer Studio"}
                    </span>
                    {product.base_colour && (
                      <span className="cat-product-color">{product.base_colour}</span>
                    )}
                  </div>

                  <h3 className="cat-product-name" title={product.product_display_name}>
                    {product.product_display_name || "Curated Item"}
                  </h3>

                  <div className="cat-product-bottomline">
                    <p className="cat-product-price">
                      INR {typeof price === "number" ? price.toLocaleString() : price || "—"}
                    </p>

                    <button
                      className="cat-quick-bag-btn"
                      onClick={() => navigate(`/products?query=${encodeURIComponent(product.product_display_name || category)}`)}
                      aria-label="Find similar"
                      title="Find similar styles"
                    >
                      <span>Find Similar</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <FooterSection />
    </div>
  );
}

export default Category;