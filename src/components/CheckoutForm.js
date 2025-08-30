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

  // FIX: Helper function to check if all required shipping fields are filled
  const isShippingInfoValid = () => {
    if (!shippingInfo) return false;
    // Check that all required fields have a value
    return shippingInfo.name && shippingInfo.email && shippingInfo.address && shippingInfo.city && shippingInfo.postalCode;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIX: Add a validation check before processing the payment
    if (!isShippingInfoValid()) {
      setMessage("Please complete all shipping information fields before proceeding.");
      return; // Stop the submission
    }

    if (!stripe || !elements || !token) {
      setMessage("Cannot process payment. Please ensure you are logged in.");
      return;
    }

    setIsLoading(true);

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
        // FIX: The button is now disabled if shipping info is invalid
        disabled={isButtonDisabled} 
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
