import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppContextProvider, AppContext } from './context/AppContext';


import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetails';
import Collection from './pages/Collection';
import ShoppingBag from './pages/ShoppingBag';
import CheckoutPage from './pages/CheckoutPage';
import OrderComplete from './pages/OrderComplete'; 
import MyOrders from './pages/MyOrders';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);




function AppContent() {
  const { products, setProducts } = useContext(AppContext);

  useEffect(() => {
    fetchProductsGlobally();
  }, []);

  const fetchProductsGlobally = async () => {
    if (products.length > 0) return; 

    try {
      const response = await fetch('http://localhost:3001/products');
      const data = await response.json();

      if (data && data.length > 0) {
        const productsWithActive = data.map((product, index) => ({
          ...product,
          active: index === 0,
          sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
          colors: product.colors || ["Black", "White", "Grey"]
        }));
        setProducts(productsWithActive);
      }
    } catch (error) {
      console.error('Error fetching products globally, using fallback:', error);
      const fallbackProducts = [
        // ... your fallback product data
      ];
      setProducts(fallbackProducts);
    }
  };

  return (
    // --- This structure ensures the sticky footer works ---
    <div className="app-container">
      <Header />
      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/shopping-bag" element={<ShoppingBag />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route 
            path="/my-orders" 
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppContextProvider>
      <Router>
        <Elements stripe={stripePromise}>
          <ScrollToTop />
          <AppContent />
        </Elements>
      </Router>
    </AppContextProvider>
  );
}