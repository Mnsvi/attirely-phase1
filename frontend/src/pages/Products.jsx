import ResultHeader from "../components/products/ResultHeader.jsx";
import ProductsGrid from "../components/products/ProductsGrid.jsx";
import ProductsError from "../components/products/ProductsError.jsx";
import FooterSection from "../components/home/FooterSection.jsx";
import { executeSearch } from "../utils/searchClient.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import "./Products.css";

function Products() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const userQuery =
    searchParams.get("query") || location.state?.searchQuery || "vintage cheetah print shawl";

  const [data, setData] = useState(location.state?.searchResult || null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(!location.state?.searchResult);
  const [error, setError] = useState(null);
  const requestVersion = useRef(0);

  const fetchProducts = useCallback(async () => {
    const currentRequest = ++requestVersion.current;

    if (location.state?.searchResult) {
      setData(location.state.searchResult);
      setFilteredProducts(location.state.searchResult.products || []);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchResult = await executeSearch(userQuery, {
        top_k: 30,
        notes_top_k: 8,
        apply_rerank: true,
      });

      if (currentRequest === requestVersion.current) {
        setData(searchResult);
        setFilteredProducts(searchResult.products || []);
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        return; // Ignore aborted previous search
      }
      console.error("Search failed:", err);
      if (currentRequest === requestVersion.current) {
        setError(err);
      }
    } finally {
      if (currentRequest === requestVersion.current) {
        setLoading(false);
      }
    }
  }, [location.state, userQuery]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;

      fetchProducts().catch((err) => {
        if (active) {
          console.error("Search failed:", err);
          setError(err);
          setLoading(false);
        }
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [fetchProducts]);

  const handleApplyFilters = (filters) => {
    if (!data || !data.products) return;

    const filtered = data.products.filter((product) => {
      const categoryMatch =
        filters.category.length === 0 ||
        filters.category.includes(product.article_type);
      const colorMatch =
        filters.color.length === 0 ||
        filters.color.includes(product.base_colour);
      const fabricMatch =
        filters.fabric.length === 0 ||
        filters.fabric.includes(product.fabric);
      const seasonMatch =
        filters.season.length === 0 ||
        filters.season.includes(product.season);
      const usageMatch =
        filters.usage.length === 0 ||
        filters.usage.includes(product.usage);
      const genderMatch =
        filters.gender.length === 0 ||
        filters.gender.includes(product.gender);
      const brandMatch =
        filters.brand.length === 0 ||
        filters.brand.includes(product.brand_name);

      const productPrice = product.discounted_price ?? product.price;
      const priceMatch =
        productPrice >= filters.minPrice && productPrice <= filters.maxPrice;

      return (
        categoryMatch && colorMatch && fabricMatch && seasonMatch &&
        usageMatch && genderMatch && brandMatch && priceMatch
      );
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="products-page">
      <Navbar />

      <main className="products-page-content">
        {error ? (
          <ProductsError userQuery={userQuery} onRetry={fetchProducts} />
        ) : (
          <>
            {!loading && data && (
              <ResultHeader
                total={filteredProducts.length}
                products={data.products}
                userQuery={data.query || userQuery}
                onApplyFilters={handleApplyFilters}
              />
            )}

            <ProductsGrid
              loading={loading}
              data={
                loading
                  ? null
                  : {
                      ...data,
                      products: filteredProducts,
                      total: filteredProducts.length,
                    }
              }
            />
          </>
        )}
      </main>

      <FooterSection />
    </div>
  );
}

export default Products;