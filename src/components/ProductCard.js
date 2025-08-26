import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function ProductCard({ product }) {
  const { addToCollection, collectionItems } = useContext(AppContext);

  // Default product for demo if none provided
  const defaultProduct = {
    id: 1,
    title: 'Fashion Item',
    subtitle: 'Premium Collection',
    backgroundImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=600&fit=crop',
    price: 199,
    originalPrice: 249,
    discount: 20,
    category: 'Spring Collection'
  };

  const item = product || defaultProduct;
  const isCollected = collectionItems.some(collectionItem => collectionItem.id === item.id);

  const handleAddToCollection = (e) => {
    e.preventDefault();
    addToCollection(item);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${item.id}`}>
          <img
            src={item.backgroundImage}
            alt={item.title}
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        
        {/* Discount Badge */}
        {item.discount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{item.discount}%
          </div>
        )}

        {/* Collection Button */}
        <button
          onClick={handleAddToCollection}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
            isCollected 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'
          }`}
        >
          <svg 
            className="w-5 h-5" 
            fill={isCollected ? 'currentColor' : 'none'}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to={`/product/${item.id}`}
            className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 bg-white">
        {/* Category */}
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">
          {item.category || item.subtitle}
        </p>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {item.title}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
               ₹{item.price}
            </span>
            {item.originalPrice && (
              <span className="text-lg text-gray-500 line-through ml-3">
                 ₹{item.originalPrice}
              </span>
            )}
          </div>

          {/* Shop Now Link */}
          <Link
            to={`/product/${item.id}`}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
