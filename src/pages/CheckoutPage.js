import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import './CheckoutPage.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
// FIX: Define the API URL for reliable requests
const API_URL = process.env.REACT_APP_API_URL || "";

function CheckoutPage() {
  const { shoppingBag, token } = useContext(AppContext);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null); // To handle potential errors

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
    // This async function will handle the API call
    const createPaymentIntent = async () => {
      if (total > 0 && token) {
        try {
          setError(null); // Clear previous errors
          const res = await fetch(`${API_URL}/api/create-payment-intent`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            // The backend only needs the total for this step
            body: JSON.stringify({
              total: total
            }),
          });

          if (!res.ok) {
            // If the server responds with an error, capture it
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to initialize payment.');
          }

          const data = await res.json();
          setClientSecret(data.clientSecret);

        } catch (err) {
          // Set the error state to display a message to the user
          console.error("Payment Intent Error:", err);
          setError(err.message);
        }
      }
    };
    
    createPaymentIntent();
  // FIX: This effect should only run when the total or token changes, not the shipping info
  }, [total, token]);

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
          {/* Show an error message if the API call failed */}
          {error && <div className="payment-error-message">{error}</div>}

          {/* Only show the payment form if the clientSecret has been successfully fetched */}
          {clientSecret && !error ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm
                totalAmount={total}
                shippingInfo={shippingInfo}
                cart={shoppingBag}
              />
            </Elements>
          ) : (
            // Only show the loading text if there isn't an error
            !error && <p>Loading payment options...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
