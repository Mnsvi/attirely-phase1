// components/products/ProductsError.jsx
import "./ProductsError.css";

function ProductsError({ userQuery, onRetry }) {
  return (
    <div className="products-error">
      <div className="products-error__icon">!</div>

      <h2 className="products-error__title">Something went wrong</h2>

      <p className="products-error__message">
        We couldn't load results for{" "}
        <span className="products-error__query">"{userQuery}"</span>.
        This is usually a connection hiccup — try again.
      </p>

      <button className="products-error__retry" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

export default ProductsError;