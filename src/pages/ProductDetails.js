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
      <div style={{
        padding: '120px 20px 60px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #ff4757',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <p>Loading product details...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{
        padding: '120px 20px 60px',
        minHeight: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2>Product Not Found</h2>
        <p>The product with ID {id} doesn't exist.</p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#ff4757',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            marginTop: '20px'
          }}
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '120px 20px 60px', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: '#6c757d', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 0.5rem', color: '#6c757d' }}>/</span>
          <span>{product.title}</span>
        </nav>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '4rem',
          background: 'white',
          borderRadius: '10px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {/* Product Images */}
          <div>
            {/* Main image */}
            <div style={{
              width: '100%',
              height: '500px',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <img
                src={selectedImage || product.backgroundImage}
                alt={product.title}
                onClick={() => openLightboxAt(gallery.findIndex(g => g === (selectedImage || product.backgroundImage)))}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: gallery.length ? 'zoom-in' : 'default' }}
              />
            </div>

            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {gallery.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(img)}
                  onDoubleClick={() => openLightboxAt(idx)}
                  style={{
                    padding: 0,
                    border: (selectedImage || product.backgroundImage) === img ? '2px solid #ff4757' : '2px solid transparent',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    width: 80,
                    height: 80,
                    cursor: 'pointer',
                    background: 'transparent'
                  }}
                  aria-label={`Select image ${idx + 1}`}
                  title="Click to select, double-click to view"
                >
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
              {/* If no thumbnails, you can optionally show nothing here */}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div style={{ color: '#ff4757', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {product.category} Collection
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
              {product.title}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#6c757d', margin: '0 0 1.5rem 0' }}>
              {product.subtitle}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4757' }}>
                 ₹ {product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize: '1.2rem', color: '#6c757d', textDecoration: 'line-through' }}>
                     ₹ {product.originalPrice}
                  </span>
                  <span style={{
                    background: '#ff4757',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p style={{ color: '#6c757d', lineHeight: '1.6', marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Size</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '0.8rem 1.2rem',
                        border: `2px solid ${selectedSize === size ? '#ff4757' : '#dee2e6'}`,
                        background: selectedSize === size ? '#ff4757' : 'white',
                        color: selectedSize === size ? 'white' : '#333',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        minWidth: '50px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Quantity</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setQuantity(prev => prev > 1 ? prev - 1 : 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid #dee2e6',
                    background: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid #dee2e6',
                    background: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0' }}>
              <button
                onClick={handleAddToBag}
                disabled={!selectedSize}
                style={{
                  flex: '1',
                  padding: '1rem 2rem',
                  background: selectedSize ? '#ff4757' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: '600',
                  cursor: selectedSize ? 'pointer' : 'not-allowed',
                  fontSize: '1rem'
                }}
              >
                Add to Bag -  ₹ {product.price * quantity}
              </button>

              <button
                onClick={handleAddToCollection}
                style={{
                  padding: '1rem 1.5rem',
                  background: isCollected ? '#ff4757' : 'white',
                  color: isCollected ? 'white' : '#ff4757',
                  border: '2px solid #ff4757',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
                aria-label="Toggle favorite"
              >
                {isCollected ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Features: keep empty or add your list */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              {/* Add any feature rows here if needed */}
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '10px 14px', cursor: 'pointer'
            }}
            aria-label="Previous image"
          >
            ‹
          </button>

          <img
            src={gallery[lightboxIndex]}
            alt={`Gallery image ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 10 }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '10px 14px', cursor: 'pointer'
            }}
            aria-label="Next image"
          >
            ›
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer'
            }}
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
