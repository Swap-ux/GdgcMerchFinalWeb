import React, { useState, useContext } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AppContext } from "../context/AppContext";

export default function CheckoutForm({ totalAmount, shippingInfo, cart }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token, showAlert } = useContext(AppContext);

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isShippingInfoValid = () => {
    if (!shippingInfo) return false;
    return shippingInfo.name && shippingInfo.email && shippingInfo.address && shippingInfo.city && shippingInfo.postalCode;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // This validation now runs when the user clicks the button
    if (!isShippingInfoValid()) {
      if (showAlert) {
        showAlert("Please fill out all shipping details first.", "error");
      }
      return; // Stop the submission
    }

    if (!stripe || !elements || !token) {
      setMessage("Cannot process payment. Please ensure you are logged in.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

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
        id="submit" 
        // FIX: The className is now conditional. The 'disabled' attribute is removed.
        className={`w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-6 ${!isShippingInfoValid() || isLoading ? 'button-disabled-visual' : ''}`}
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" /> : `Pay ₹${totalAmount.toFixed(2)}`}
        </span>
      </button>
      {message && <div id="payment-message" className="text-red-500 mt-2">{message}</div>}
    </form>
  );
}
