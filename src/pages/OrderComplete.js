import React, { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { AppContext } from '../context/AppContext';

function OrderComplete() {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();
  const { clearShoppingBag, token } = useContext(AppContext);
  const [paymentStatus, setPaymentStatus] = useState('verifying');

  useEffect(() => {
    const processOrder = async () => {
      if (!stripe || !token) {
        return;
      }

      const clientSecret = searchParams.get('payment_intent_client_secret');
      if (!clientSecret) {
        setPaymentStatus('failed');
        return;
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

      switch (paymentIntent.status) {
        case "succeeded":
          try {
            const savedOrderDetailsJSON = sessionStorage.getItem('orderDetailsForCompletion');
            if (savedOrderDetailsJSON) {
              const orderDetails = JSON.parse(savedOrderDetailsJSON);

              // --- FIX: Use the full backend URL here ---
              const response = await fetch('http://localhost:5000/api/create-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  cart: orderDetails.cart,
                  total: orderDetails.total,
                  shippingInfo: orderDetails.shippingInfo,
                  paymentIntentId: paymentIntent.id,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to save order on the server.');
              }
              
              sessionStorage.removeItem('orderDetailsForCompletion');
            }
          } catch (error) {
            console.error("Failed to save order:", error);
          }
          
          setPaymentStatus('succeeded');
          clearShoppingBag();
          break;
        case "processing":
          setPaymentStatus('processing');
          break;
        default:
          setPaymentStatus('failed');
          break;
      }
    };

    processOrder();
  }, [stripe, searchParams, clearShoppingBag, token]);


  const renderStatus = () => {
    switch (paymentStatus) {
      case 'succeeded':
        return (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Payment Successful!</h2>
            <p style={{ marginBottom: '2rem' }}>Thank you for your order. Your items will be shipped soon.</p>
          </>
        );
      case 'processing':
        return (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Payment Processing</h2>
            <p style={{ marginBottom: '2rem' }}>We are processing your payment. We will notify you when it's complete.</p>
          </>
        );
      case 'failed':
        return (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc3545' }}>Payment Failed</h2>
            <p style={{ marginBottom: '2rem' }}>Unfortunately, we were unable to process your payment. Please try again or contact support.</p>
          </>
        );
      default:
        return (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Verifying Payment...</h2>
            <p style={{ marginBottom: '2rem' }}>Please wait while we confirm your payment status.</p>
          </>
        );
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {renderStatus()}
      <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#111', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Continue Shopping
      </Link>
    </div>
  );
}

export default OrderComplete;