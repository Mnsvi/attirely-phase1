import "./ProductsGrid.css";
import ProductCard from "./ProductCard";
import SearchLoading from "./SearchLoading";

function ProductsGrid({ data, filteredProducts, total, loading }) {
  return (
    <div className="products-grid">
      {loading ? (
        <SearchLoading />
      ) : (
        <ProductCard data={data} filteredProducts={filteredProducts} total={total} />
      )}
    </div>
  );
}

export default ProductsGrid;