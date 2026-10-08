// components/products/ProductCardSkeleton.jsx
import "./ProductCardSkeleton.css";

function ProductCardSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div className="product-card-skeleton" key={index}>
          <div className="skeleton-image" />

          <div className="skeleton-about">
            <div className="skeleton-line skeleton-line--brand" />
            <div className="skeleton-line skeleton-line--name" />
            <div className="skeleton-line skeleton-line--price" />
          </div>
        </div>
      ))}
    </>
  );
}

export default ProductCardSkeleton;