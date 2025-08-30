import React, { useState, useContext } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AppContext } from "../context/AppContext";

// This component accepts the full cart and shipping info as props
export default function CheckoutForm({ totalAmount, shippingInfo, cart }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useContext(AppContext);

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !token) {
      setMessage("Cannot process payment. Please ensure you are logged in.");
      return;
    }

    setIsLoading(true);

    // --- THIS IS THE CRITICAL STEP ---
    // It saves the order details to sessionStorage before redirecting to Stripe.
    const orderDetails = {
      cart: cart,
      total: totalAmount,
      shippingInfo: shippingInfo,
    };
    sessionStorage.setItem('orderDetailsForCompletion', JSON.stringify(orderDetails));


    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-complete`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit" 
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-6"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" /> : `Pay ₹${totalAmount.toFixed(2)}`}
        </span>
      </button>
      {message && <div id="payment-message" className="text-red-500 mt-2">{message}</div>}
    </form>
  );
}