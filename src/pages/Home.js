import React, { useContext } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

function Home() {
  const { products } = useContext(AppContext);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 
              className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900"
              style={{ fontFamily: 'Great Vibes, cursive' }}
            >
              Featured Collections
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our GDGC collections 
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          
        </div>
      </section>

      
    </div>
  );
}

export default Home;