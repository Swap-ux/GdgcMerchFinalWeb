import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import './CheckoutPage.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutPage() {
  // --- UPDATED: Get the token from context ---
  const { shoppingBag, token } = useContext(AppContext);
  const [clientSecret, setClientSecret] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'IN', // Use ISO code for Stripe
  });

  const subtotal = shoppingBag.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Fetch the clientSecret from your backend
  useEffect(() => {
    // Only fetch if there's a total to pay and the user is logged in
    if (total > 0 && token) {
      fetch("/api/create-payment-intent", {
    method: "POST",
        headers: {
          "Content-Type": "application/json",
          // --- UPDATED: Add the Authorization header ---
          "Authorization": `Bearer ${token}`
        },
        // --- UPDATED: Send all required info to the backend ---
        body: JSON.stringify({
          total: total,
          cart: shoppingBag,
          shippingInfo: shippingInfo
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
    // Rerun this effect if any of these values change
  }, [total, token, shoppingBag, shippingInfo]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const appearance = {
    theme: 'stripe',
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="checkout-page">
      {/* Left Column: Shipping Details */}
      <div className="checkout-form">
        <h2 className="checkout-section-title">Shipping Information</h2>
        <form>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" value={shippingInfo.name} onChange={handleShippingChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" value={shippingInfo.email} onChange={handleShippingChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input type="text" id="address" name="address" value={shippingInfo.address} onChange={handleShippingChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input type="text" id="city" name="city" value={shippingInfo.city} onChange={handleShippingChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="postalCode">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" value={shippingInfo.postalCode} onChange={handleShippingChange} required />
          </div>
        </form>
      </div>

      {/* Right Column: Order Summary & Payment */}
      <div className="order-summary">
        <h2 className="checkout-section-title">Order Summary</h2>
        <div className="summary-details">
          <div className="summary-item">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tax (8%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-item total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="payment-container">
          <h3 className="checkout-section-title">Payment Details</h3>
          {clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              {/* --- UPDATED: Pass cart and shippingInfo to the form --- */}
              <CheckoutForm
                totalAmount={total}
                shippingInfo={shippingInfo}
                cart={shoppingBag}
              />
            </Elements>
          ) : (
            <p>Loading payment options...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
