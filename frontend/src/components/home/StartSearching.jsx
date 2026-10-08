import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { executeSearch, prefetchSearch } from "../../utils/searchClient.js";

import "./StartSearching.css";

import leftHandPurses from "../../assets/images/left-hand-purses.png";
import rightHandPurses from "../../assets/images/right-hand-purses.png";

gsap.registerPlugin(TextPlugin);

function StartSearching() {
  const navigate = useNavigate();

  const [queryText, setQueryText] = useState("");
  const [status, setStatus] = useState("idle");
  const [activeTab, setActiveTab] = useState("text");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchError, setSearchError] = useState("");

  const typingTextRef = useRef(null);
  const cursorRef = useRef(null);

  const suggestions = [
    "Vintage Cheetah Print Shawl",
    "Structured Denim Corset",
    "Leather Knee Boots",
    "Tailored Blazer",
    "Pleated Midi Skirt",
  ];

  // Typewriter animation
  useEffect(() => {
    const words = ["STYLE", "VIBE", "AESTHETICS", "LOOK", "ATTIRE"];
    const text = typingTextRef.current;
    const cursor = cursorRef.current;

    const tl = gsap.timeline({
      repeat: -1,
    });

    words.forEach((word) => {
      tl.to(text, {
        duration: word.length * 0.14,
        text: word,
        ease: "none",
      })
        .to({}, { duration: 1.2 })
        .to(text, {
          duration: word.length * 0.08,
          text: "",
          ease: "none",
        })
        .to({}, { duration: 0.25 });
    });

    gsap.to(cursor, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)",
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(cursor);
    };
  }, []);

  // Tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setStatus("idle");
    setSearchError("");
  };

  // Image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setSearchError("Please choose an image under 10MB.");
      return;
    }

    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(previewUrl);
    setSearchError("");
  };

  // Remove image
  const handleImageRemove = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview(null);
    setSearchError("");
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSearch = async (event) => {
    event?.preventDefault();
    if (status === "loading") return;
    setSearchError("");

    if (activeTab === "text") {
      const query = queryText.trim();
      if (!query) return;

      setStatus("loading");
      navigate(`/products?query=${encodeURIComponent(query)}`);
      return;
    }

    if (activeTab === "image") {
      if (!selectedImage) return;

      setStatus("loading");

      try {
        const imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
          reader.onerror = () => reject(new Error("Unable to read the selected image."));
          reader.readAsDataURL(selectedImage);
        });
        const searchResult = await executeSearch("", { image_base64: imageBase64 });
        navigate("/products?query=visual-search", {
          state: { searchResult, searchQuery: "visual search" },
        });
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setSearchError("We couldn't complete that visual search. Please try again.");
        }
      } finally {
        setStatus("idle");
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (status === "loading") return;
    setQueryText(suggestion);
    navigate(`/products?query=${encodeURIComponent(suggestion)}`);
  };

  return (
    <section id="search" className="search-section" aria-label="Fashion Search Studio">
      <div className="search-section__backdrop-assets">
        <img src={leftHandPurses} alt="Designer Purses Left" className="search-section__asset-left" />
        <img src={rightHandPurses} alt="Designer Purses Right" className="search-section__asset-right" />
      </div>

      <div className="search-section__heading">
        <span className="search-section__kicker">MULTIMODAL NEURAL ENGINE</span>
        <h2 className="search-section__headline">
          <span className="headline-part headline-part--light">DEFI</span>
          <span className="headline-part headline-part--navy">N</span>
          <span className="headline-part headline-part--accent">E</span>
          <span className="headline-space"> </span>
          <span className="headline-part headline-part--dark">YOUR</span>
          <span className="headline-space"> </span>
          <span className="headline-part headline-part--accent search-section__typing-word">
            <span ref={typingTextRef}></span>
            <span ref={cursorRef} className="search-section__typing-cursor" />
          </span>
        </h2>
      </div>

      <div className="search-section__panel">
        <div className="search-section__panel-header">
          <h3 className="search-section__title">Intelligent Fashion Search</h3>
          <p className="search-section__subtitle">
            Describe any aesthetic, garment, silhouette or upload an inspiration image.
          </p>
        </div>
        {searchError && (
          <p className="search-section__error" role="alert">
            {searchError}
          </p>
        )}

        {/* Tabs */}
        <div className="search-section__tabs" role="tablist">
          <button
            type="button"
            className={`search-section__tab ${
              activeTab === "text" ? "search-section__tab--active" : ""
            }`}
            onClick={() => handleTabSwitch("text")}
            role="tab"
            aria-selected={activeTab === "text"}
          >
            <svg className="tab-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="16" y1="16" x2="21" y2="21" />
            </svg>
            <span>Text Search</span>
          </button>

          <button
            type="button"
            className={`search-section__tab ${
              activeTab === "image" ? "search-section__tab--active" : ""
            }`}
            onClick={() => handleTabSwitch("image")}
            role="tab"
            aria-selected={activeTab === "image"}
          >
            <svg className="tab-icon" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Visual Image Search</span>
          </button>
        </div>

        {/* TEXT SEARCH */}
        {activeTab === "text" && (
          <div className="search-section__tab-panel" role="tabpanel">
            <form className="search-section__form" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <svg className="input-search-icon" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16" y1="16" x2="21" y2="21" />
                </svg>
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="e.g. vintage cheetah print shawl, tailored wool coat..."
                  className="search-section__input"
                  aria-label="Search products"
                />
                {queryText && (
                  <button
                    type="button"
                    className="clear-input-btn"
                    onClick={() => setQueryText("")}
                    aria-label="Clear query"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="search-section__submit"
                disabled={status === "loading" || !queryText.trim()}
              >
                {status === "loading" ? (
                  <span className="search-loading-text">
                    <span className="search-spinner" /> Searching...
                  </span>
                ) : (
                  <span>EXPLORE MATCHES →</span>
                )}
              </button>
            </form>

            <div className="search-suggestions">
              <span className="suggestions-label">Trending Curations:</span>
              <div className="suggestions-list">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggestion-pill"
                    onMouseEnter={() => prefetchSearch(item)}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMAGE SEARCH */}
        {activeTab === "image" && (
          <div className="search-section__tab-panel" role="tabpanel">
            <div className="search-section__image-upload">
              {!selectedImage ? (
                <label
                  htmlFor="image-upload-input"
                  className="search-section__image-upload-box"
                >
                  <div className="upload-icon-circle">
                    <svg viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span className="upload-main-text">Upload or Drop an Outfit Image</span>
                  <span className="upload-sub-text">PNG, JPG, or WEBP up to 10MB</span>
                </label>
              ) : (
                <div className="search-section__image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Selected clothing preview"
                    className="search-section__image-preview"
                  />
                  <div className="preview-overlay-info">
                    <span>Ready for visual similarity match</span>
                    <button
                      type="button"
                      className="search-section__remove-image"
                      onClick={handleImageRemove}
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <input
                id="image-upload-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageSelect}
                hidden
              />
            </div>

            {selectedImage && (
              <button
                type="button"
                className="search-section__image-search-btn"
                onClick={handleSearch}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <span className="search-section__btn-spinner" />
                    <span>Analyzing Visual Embeddings...</span>
                  </>
                ) : (
                  <>
                    <span>FIND SIMILAR PRODUCTS</span>
                    <span>→</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default StartSearching;
