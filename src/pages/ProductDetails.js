import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function ProductDetail() {
  const { id } = useParams();
  const { products, addToShoppingBag, addToCollection, collectionItems } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState('');
  const [gallery, setGallery] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    findProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (products && products.length > 0 && !product) {
      findProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const findProduct = () => {
    if (products && products.length > 0) {
      const foundProduct = products.find((p) => Number(p.id) === Number(id));
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedColor(foundProduct.colors?.[0] || '');
        setLoading(false);
        return;
      }
    }
    if (!products || products.length === 0) {
      return; // wait for global load
    }
    setLoading(false); // product not found
  };

  useEffect(() => {
    if (!product) return;
    // Build gallery from main image + thumbnails
    const images = [
      product.backgroundImage,
      ...(product.thumbnails || [])
    ].filter(Boolean);
    setGallery(images);
    setSelectedImage(images[0] || product.backgroundImage || '');
  }, [product]);

  const openLightboxAt = (index) => {
    if (!gallery.length) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => setLightboxIndex((i) => (i + 1) % gallery.length);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length);

  const handleAddToBag = () => {
    if (product && selectedSize) {
      addToShoppingBag(product, selectedSize, quantity, selectedColor);
      alert(`Added ${quantity} ${product.title} (${selectedSize}) to your bag!`);
    } else {
      alert('Please select a size first!');
    }
  };

  const handleAddToCollection = () => {
    if (product) addToCollection(product);
  };

  const isCollected = product && collectionItems.some(item => item.id === product.id);

  if (loading || !products || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 md:py-32">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 md:mb-6"></div>
        <p className="text-gray-600 text-sm md:text-base">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6 text-sm md:text-base">The product with ID {id} doesn't exist.</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 md:px-6 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm md:text-base"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-4 md:mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.title}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Product Images */}
            <div>
              {/* Main image */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden mb-4 cursor-zoom-in"
                onClick={() => openLightboxAt(gallery.findIndex(g => g === (selectedImage || product.backgroundImage)))}>
                <img
                  src={selectedImage || product.backgroundImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                {gallery.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImage(img)}
                    onDoubleClick={() => openLightboxAt(idx)}
                    className={`p-0.5 rounded overflow-hidden w-16 h-16 md:w-20 md:h-20 focus:outline-none ${(selectedImage || product.backgroundImage) === img ? 'border-2 border-red-500' : 'border border-gray-200'}`}
                    aria-label={`Select image ${idx + 1}`}
                    title="Click to select, double-click to view"
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="py-2 md:py-4">
              <div className="text-red-500 text-xs md:text-sm font-semibold uppercase mb-1 md:mb-2">
                {product.category} Collection
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                {product.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                <span className="text-2xl md:text-3xl font-bold text-red-500">
                  ₹ {product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹ {product.originalPrice}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 md:mb-8">
                {product.description}
              </p>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h4 className="text-gray-900 font-medium mb-2 text-sm md:text-base">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 md:px-4 md:py-2.5 text-sm font-medium rounded border transition-colors ${selectedSize === size 
                          ? 'bg-red-500 text-white border-red-500' 
                          : 'bg-white text-gray-800 border-gray-300 hover:border-red-300'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-gray-900 font-medium mb-2 text-sm md:text-base">Quantity</h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(prev => prev > 1 ? prev - 1 : 1)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-md text-lg font-bold hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-md text-lg font-bold hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
                <button
                  onClick={handleAddToBag}
                  disabled={!selectedSize}
                  className={`flex-1 py-3 px-6 rounded-md font-semibold text-white transition-colors ${!selectedSize 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Add to Bag - ₹ {product.price * quantity}
                </button>

                <button
                  onClick={handleAddToCollection}
                  className={`p-3 rounded-md border transition-colors ${isCollected 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-white text-red-500 border-red-500 hover:bg-red-50'}`}
                  aria-label="Toggle favorite"
                >
                  {isCollected ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                {/* Add any feature rows here if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
        >
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-2 md:p-3 rounded-md hover:bg-opacity-30 transition-colors"
            aria-label="Previous image"
          >
            ‹
          </button>

          <div className="max-w-full max-h-full flex items-center justify-center">
            <img
              src={gallery[lightboxIndex]}
              alt={`Gallery image ${lightboxIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded"
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-2 md:p-3 rounded-md hover:bg-opacity-30 transition-colors"
            aria-label="Next image"
          >
            ›
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-md hover:bg-opacity-30 transition-colors"
            aria-label="Close viewer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
