import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ResetPassword from './pages/ResetPassword';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function AppContent() {
  const { products, setProducts, setIsLoading } = useContext(AppContext);

  useEffect(() => {
    const fetchProductsGlobally = async () => {
      if (products.length > 0) {
        setIsLoading(false);
        return;
      }
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      try {
        const response = await fetch(`${API_URL}/api/products`);
        
        // --- THIS IS THE CRITICAL FIX ---
        const responseData = await response.json();        // Gets the object { products: [...] }
        const data = responseData.products;             // Extracts the array [...] from the object

        if (Array.isArray(data) && data.length > 0) {
          const productsWithActive = data.map((product, index) => ({
            ...product,
            active: index === 0,
            sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
            colors: product.colors || ["Black", "White", "Grey"]
          }));
          setProducts(productsWithActive);
        }
      } catch (error) {
        console.error('CRITICAL ERROR processing products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsGlobally();
    
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
