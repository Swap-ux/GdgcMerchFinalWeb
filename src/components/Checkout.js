import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'; // Your existing form component

// Initialize Stripe outside of the component to avoid re-creating on every render
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function Checkout({ totalAmount }) {
  const [clientSecret, setClientSecret] = useState("");

  // Fetch the clientSecret from your backend as soon as this component loads
  useEffect(() => {
    fetch("http://localhost:5000/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total: totalAmount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [totalAmount]);

  const appearance = {
    theme: 'stripe',
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="checkout-container">
      {clientSecret ? (
        // Once the clientSecret is loaded, render the Elements provider and the form
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm totalAmount={totalAmount} />
        </Elements>
      ) : (
        // While loading, you can show a spinner or a message
        <p>Loading payment form...</p>
      )}
    </div>
  );
}