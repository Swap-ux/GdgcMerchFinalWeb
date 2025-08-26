import React, { useContext, useEffect, useRef } from 'react';
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
  const { products, setProducts, addToCollection, collectionItems } = useContext(AppContext);
  const swiperRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/products');
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Set first product as active
        const productsWithActive = data.map((product, index) => ({
          ...product,
          active: index === 0
        }));
        setProducts(productsWithActive);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use local data as fallback
      setFallbackData();
    }
  };

  const setFallbackData = () => {
    const fallbackProducts = [
      {
        id: 1,
        title: "Winter Collection",
        subtitle: "New Arrivals 2024",
        description: "Stay warm and stylish with our exclusive winter collection featuring premium fabrics and contemporary designs.",
       backgroundImage: "/images/background-model1.png",
      "thumbnails": [
    "/images/hoodie-1.png" 
  ],
        number: "01",
        active: true,
        price: 299,
        originalPrice: 399,
        discount: 25
      },
      {
        id: 2,
        title: "Spring Collection",
        subtitle: "Fresh & Vibrant",
        description: "Brighten up your wardrobe with our fresh spring collection. Light fabrics and vibrant colors await.",
        backgroundImage: "/images/background-model2.png",
        "thumbnails": [
    "/images/hoodie-2.png" 
        ],
        active: false,
        price: 199,
        originalPrice: 249,
        discount: 20
      },
      {
        id: 3,
        title: "Summer Collection",
        subtitle: "Beach Ready",
        description: "Get ready for summer adventures with our lightweight and breathable summer essentials collection.",
        backgroundImage: "/images/background-model3.png",
        active: false,
        price: 159,
        originalPrice: 199,
        discount: 30
      }
    ];
    setProducts(fallbackProducts);
  };

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

  if (!products || products.length === 0) {
    return <div className="hero loading">Loading products...</div>;
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

        {/* Swiper for background switching */}
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

      <div className="scroll-indicator">
        <div className="scroll-text">Scroll</div>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}

export default Hero;
