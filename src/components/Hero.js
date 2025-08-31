import React, { useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Navigation, Pagination } from 'swiper/modules';
import { AppContext } from '../context/AppContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Hero.css';

function Hero() {
  const { products, setProducts, addToCollection, collectionItems, isLoading } = useContext(AppContext);
  const swiperRef = useRef(null);

  const handleSlideChange = (swiper) => {
    const activeIndex = swiper.activeIndex;
    const updatedProducts = products.map((product, index) => ({
      ...product,
      active: index === activeIndex
    }));
    setProducts(updatedProducts);
  };

  const handleAddToCollection = (product) => {
    addToCollection(product);
  };

  const isCollected = (productId) => {
    return collectionItems.some(item => item.id === productId);
  };

  if (isLoading) {
    return <div className="hero loading">Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return <div className="hero error">No products could be found.</div>;
  }

  const activeProduct = products.find(p => p.active) || products[0];

  return (
    <section 
      className="hero" 
      style={{ backgroundImage: `url(${activeProduct.backgroundImage})` }}
    >
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-number">{activeProduct.number}</span>
          {/* --- THIS IS THE CORRECTED LINE --- */}
          <h1 className="hero-title">{activeProduct.title}</h1>
          <h2 className="hero-subtitle">{activeProduct.subtitle}</h2>
          <p className="hero-description">{activeProduct.description}</p>
          
          <div className="hero-price">
            <span className="current-price">₹{activeProduct.price}</span>
            {activeProduct.originalPrice && (
              <span className="original-price">₹{activeProduct.originalPrice}</span>
            )}
            {activeProduct.discount && (
              <span className="discount">{activeProduct.discount}% OFF</span>
            )}
          </div>

          <div className="hero-actions">
            <Link to={`/product/${activeProduct.id}`} className="btn btn-primary">
              Shop Now
            </Link>
            
            <button 
              className={`btn-collection ${isCollected(activeProduct.id) ? 'collected' : ''}`}
              onClick={() => handleAddToCollection(activeProduct)}
            >
              <i className="bi bi-heart-fill"></i>
            </button>
          </div>
        </div>

        <Swiper
          ref={swiperRef}
          modules={[EffectFade, Autoplay, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ 
            delay: 4000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true 
          }}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet hero-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active hero-pagination-bullet-active'
          }}
          onSlideChange={handleSlideChange}
          className="hero-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              {/* Empty slide - content is managed by hero-content above */}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

  

    </section>
  );
}

export default Hero;
