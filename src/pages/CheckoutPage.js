import React, 'useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import './CheckoutPage.css';

// Use the environment variable for your Stripe key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
// BUG FIX: Use the environment variable for your API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CheckoutPage() {
  const { shoppingBag, token } = useContext(AppContext);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null); // State for handling errors

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'IN',
  });

  const subtotal = shoppingBag.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Fetch the clientSecret from your backend
  useEffect(() => {
    const createPaymentIntent = async () => {
      // Only fetch if there's a total to pay and the user is logged in
      if (total > 0 && token) {
        try {
          setError(null); // Clear any previous errors
          const response = await fetch(`${API_URL}/api/create-payment-intent`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            // The backend only needs the total to create the intent
            body: JSON.stringify({ total: total }),
          });

          if (!response.ok) {
            throw new Error('Failed to initialize payment. Please try again.');
          }

          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (err) {
          console.error("Error creating payment intent:", err);
          setError(err.message);
        }
      }
    };

    createPaymentIntent();
    // BUG FIX: Simplified the dependency array to prevent excessive API calls
  }, [total, token]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const appearance = { theme: 'stripe' };
  const options = { clientSecret, appearance };

  return (
    <div className="checkout-page">
      {/* Left Column: Shipping Details */}
      <div className="checkout-form">
        <h2 className="checkout-section-title">Shipping Information</h2>
        <form>
            {/* Your form inputs remain the same */}
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
            {/* Your summary items remain the same */}
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
