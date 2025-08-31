import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function ProductCard({ product }) {
  // REMOVED: addToShoppingBag from context
  const { addToCollection, collectionItems } = useContext(AppContext);

  // Default product for demo if none provided
  const defaultProduct = {
    id: 1,
    title: "Premium Fashion Item",
    subtitle: "Exclusive Collection",
    backgroundImage:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=600&fit=crop",
    price: 199,
    originalPrice: 249,
    discount: 20,
    category: "Spring Collection",
    colors: ["bg-red-500", "bg-blue-500", "bg-green-500"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    reviews: 24,
  };

  const item = product || defaultProduct;
  const isCollected = collectionItems.some(
    (collectionItem) => collectionItem.id === item.id
  );

  const handleAddToCollection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCollection(item);
  };

  // REMOVED: The handleAddToBag function is now gone.

  // Generate star ratings
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(item.rating);
    const hasHalfStar = item.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(item.rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Product Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${item.id}`}>
          <img
            src={item.backgroundImage}
            alt={item.title}
            className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge */}
        {item.discount && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
            {item.discount}% OFF
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {/* Wishlist Button */}
          <button
            onClick={handleAddToCollection}
            className={`p-2.5 rounded-full shadow-md transition-all duration-300 transform hover:scale-110 ${
              isCollected
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-red-500 hover:text-white"
            }`}
            aria-label={
              isCollected ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <svg
              className="w-5 h-5"
              fill={isCollected ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* REMOVED: The "Add to Bag" button that appeared on hover is now gone. */}
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
          {item.category || item.subtitle}
        </p>

        {/* Title */}
        <Link to={`/product/${item.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2.5 hover:text-blue-600 transition-colors line-clamp-2">
            {item.title}
          </h3>
        </Link>

        {/* Color Options */}
        {item.colors && (
          <div className="flex space-x-2 mb-4">
            {item.colors.map((color, index) => (
              <span
                key={index}
                className={`w-4 h-4 rounded-full ${color} border border-gray-200`}
              ></span>
            ))}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              ₹{item.price}
            </span>
            {item.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ₹{item.originalPrice}
              </span>
            )}
          </div>

          {/* Quick Shop Link */}
          <Link
            to={`/product/${item.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
          >
            Details
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
