import React, { useState, useContext } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AppContext } from "../context/AppContext";

// This component accepts the full cart and shipping info as props
export default function CheckoutForm({ totalAmount, shippingInfo, cart }) {
  const stripe = useStripe();
  const elements = useElements();
  // FIX: Get the showAlert function from your global context
  const { token, showAlert } = useContext(AppContext);

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isShippingInfoValid = () => {
    if (!shippingInfo) return false;
    return shippingInfo.name && shippingInfo.email && shippingInfo.address && shippingInfo.city && shippingInfo.postalCode;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isShippingInfoValid()) {
      // FIX: Trigger the global alert instead of the small text message
      // This will show the pop-up alert at the top of the page.
      if (showAlert) {
        showAlert("Please fill out all shipping details first.", "error");
      } else {
        // Fallback in case showAlert is not available
        setMessage("Please complete all shipping information fields before proceeding.");
      }
      return; // Stop the submission
    }

    if (!stripe || !elements || !token) {
      setMessage("Cannot process payment. Please ensure you are logged in.");
      return;
    }

    setIsLoading(true);
    setMessage(null); // Clear any previous local messages

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

  const isButtonDisabled = isLoading || !stripe || !elements || !isShippingInfoValid();

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button 
        disabled={isButtonDisabled} 
        id="submit" 
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-6"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" /> : `Pay ₹${totalAmount.toFixed(2)}`}
        </span>
      </button>
      {/* This local message is still used for Stripe-specific errors */}
      {message && <div id="payment-message" className="text-red-500 mt-2">{message}</div>}
    </form>
  );
}
