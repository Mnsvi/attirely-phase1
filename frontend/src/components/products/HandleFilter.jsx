import { useEffect, useMemo, useState } from "react";
import "./HandleFilter.css";

function HandleFilter({ products, onApply }) {
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: [],
    color: [],
    fabric: [],
    season: [],
    usage: [],
    gender: [],
    brand: [],
    minPrice: 0,
    maxPrice: 10000,
  });

  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add("filter-open");
      document.body.classList.add("filter-open");
    } else {
      document.documentElement.classList.remove("filter-open");
      document.body.classList.remove("filter-open");
    }

    return () => {
      document.documentElement.classList.remove("filter-open");
      document.body.classList.remove("filter-open");
    };
  }, [isOpen]);

  /*
   * Create filter options dynamically from the products.
   */
  const filterOptions = useMemo(() => {
    const getUnique = (key) => {
      return [
        ...new Set(
          (products || [])
            .map((product) => product[key])
            .filter(
              (value) => value !== null && value !== undefined && value !== "",
            ),
        ),
      ].sort();
    };

    return {
      category: getUnique("article_type"),
      color: getUnique("base_colour"),
      fabric: getUnique("fabric"),
      season: getUnique("season"),
      usage: getUnique("usage"),
      gender: getUnique("gender"),
      brand: getUnique("brand_name"),
    };
  }, [products]);

  /*
   * Highest product price for adaptive slider
   */
  const highestPrice = useMemo(() => {
    if (!products || !products.length) return 10000;

    return Math.ceil(
      Math.max(
        ...products.map((product) => product.discounted_price || product.price || 0),
      ),
    );
  }, [products]);

  useEffect(() => {
    setDraftFilters((prev) => ({
      ...prev,
      maxPrice: highestPrice,
    }));
  }, [highestPrice]);

  const handleOpen = () => {
    setDraftFilters(filters);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCheckbox = (filterName, value) => {
    setDraftFilters((prev) => {
      const currentValues = prev[filterName] || [];
      const alreadySelected = currentValues.includes(value);

      return {
        ...prev,
        [filterName]: alreadySelected
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleMinPrice = (event) => {
    const value = Number(event.target.value);
    setDraftFilters((prev) => ({
      ...prev,
      minPrice: Math.min(value, prev.maxPrice),
    }));
  };

  const handleMaxPrice = (event) => {
    const value = Number(event.target.value);
    setDraftFilters((prev) => ({
      ...prev,
      maxPrice: Math.max(value, prev.minPrice),
    }));
  };

  const handleClear = () => {
    const clearedFilters = {
      category: [],
      color: [],
      fabric: [],
      season: [],
      usage: [],
      gender: [],
      brand: [],
      minPrice: 0,
      maxPrice: highestPrice,
    };

    setDraftFilters(clearedFilters);
    setFilters(clearedFilters);
    onApply(clearedFilters);
  };

  const handleApply = () => {
    setFilters(draftFilters);
    onApply(draftFilters);
    setIsOpen(false);
  };

  const activeFilterCount =
    filters.category.length +
    filters.color.length +
    filters.fabric.length +
    filters.season.length +
    filters.usage.length +
    filters.gender.length +
    filters.brand.length +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice < highestPrice ? 1 : 0);

  const renderOptions = (filterName, options) => {
    if (!options || options.length === 0) return <p className="filter-empty">No options available</p>;
    return (
      <div className="filter-options">
        {options.map((option) => (
          <label className="filter-option" key={option}>
            <input
              type="checkbox"
              checked={(draftFilters[filterName] || []).includes(option)}
              onChange={() => handleCheckbox(filterName, option)}
            />
            <span className="custom-checkbox" />
            <span className="filter-option-label">{option}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* FILTER TRIGGER BUTTON */}
      <button
        className={`filter-button ${activeFilterCount > 0 ? "filter-button--active" : ""}`}
        onClick={handleOpen}
        aria-label="Open filter drawer"
      >
        <svg className="filter-btn-icon" viewBox="0 0 24 24">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="8" cy="6" r="2" fill="var(--color-cream)" />
          <circle cx="16" cy="12" r="2" fill="var(--color-cream)" />
          <circle cx="10" cy="18" r="2" fill="var(--color-cream)" />
        </svg>
        <span className="filter-btn-text">FILTERS</span>
        {activeFilterCount > 0 && (
          <span className="filter-count-badge">{activeFilterCount}</span>
        )}
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="filter-overlay"
          onClick={handleClose}
          aria-label="Close filters overlay"
        />
      )}

      {/* SIDE PANEL */}
      <aside
        className={`filter-panel ${isOpen ? "filter-panel-open" : ""}`}
        aria-label="Refine products panel"
      >
        {/* HEADER */}
        <div className="filter-panel-header">
          <div className="filter-panel-title-box">
            <h2>REFINE SELECTION</h2>
            <span className="filter-panel-subtitle">Tailor your aesthetic parameters</span>
          </div>

          <button
            className="filter-close-button"
            onClick={handleClose}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="filter-panel-content">
          {/* CATEGORY */}
          <section className="filter-section">
            <h3 className="filter-heading">Category</h3>
            {renderOptions("category", filterOptions.category)}
          </section>

          {/* COLOR */}
          <section className="filter-section">
            <h3 className="filter-heading">Color Palette</h3>
            {renderOptions("color", filterOptions.color)}
          </section>

          {/* PRICE RANGE */}
          <section className="filter-section">
            <h3 className="filter-heading">Price Range (INR)</h3>
            <div className="price-values">
              <span className="price-tag">₹{draftFilters.minPrice.toLocaleString()}</span>
              <span className="price-sep">—</span>
              <span className="price-tag">₹{draftFilters.maxPrice.toLocaleString()}</span>
            </div>

            <div className="price-sliders">
              <input
                type="range"
                min="0"
                max={highestPrice}
                value={draftFilters.minPrice}
                onChange={handleMinPrice}
                aria-label="Minimum price"
              />
              <input
                type="range"
                min="0"
                max={highestPrice}
                value={draftFilters.maxPrice}
                onChange={handleMaxPrice}
                aria-label="Maximum price"
              />
            </div>
          </section>

          {/* FABRIC */}
          {filterOptions.fabric.length > 0 && (
            <section className="filter-section">
              <h3 className="filter-heading">Fabric & Material</h3>
              {renderOptions("fabric", filterOptions.fabric)}
            </section>
          )}

          {/* SEASON */}
          {filterOptions.season.length > 0 && (
            <section className="filter-section">
              <h3 className="filter-heading">Season</h3>
              {renderOptions("season", filterOptions.season)}
            </section>
          )}

          {/* USAGE / OCCASION */}
          {filterOptions.usage.length > 0 && (
            <section className="filter-section">
              <h3 className="filter-heading">Occasion & Usage</h3>
              {renderOptions("usage", filterOptions.usage)}
            </section>
          )}

          {/* GENDER */}
          {filterOptions.gender.length > 0 && (
            <section className="filter-section">
              <h3 className="filter-heading">Gender</h3>
              {renderOptions("gender", filterOptions.gender)}
            </section>
          )}

          {/* BRAND */}
          {filterOptions.brand.length > 0 && (
            <section className="filter-section">
              <h3 className="filter-heading">Designer Brand</h3>
              {renderOptions("brand", filterOptions.brand)}
            </section>
          )}
        </div>

        {/* FOOTER */}
        <div className="filter-panel-footer">
          <button className="clear-filter-button" onClick={handleClear}>
            RESET ALL
          </button>

          <button className="apply-filter-button" onClick={handleApply}>
            APPLY FILTERS {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </button>
        </div>
      </aside>
    </>
  );
}

export default HandleFilter;
