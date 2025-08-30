import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './MyOrders.css';

function MyOrders() {
  const { token } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setLoading(false);
        setError("You must be logged in to view your orders.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- UPDATED JSX WITH IMPROVED LAYOUT FOR ALL STATES ---
  return (
    <div className="my-orders-page">
      <h1 className="my-orders-title">My Orders</h1>

      {loading && (
        <div className="orders-placeholder">
          <h3>Loading Your Orders...</h3>
          <p>Please wait a moment.</p>
        </div>
      )}
      
      {error && (
        <div className="orders-placeholder">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3>An Error Occurred</h3>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="orders-placeholder">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-4-4m-4 4l-4-4m8 4l-4 4m-4-4l-4 4" /></svg>
              <h3>No Orders Found</h3>
              <p>You haven't placed any orders with us yet.</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-header-details">
                      <div>
                        <span>Order Placed</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div>
                        <span>Total</span>
                        <span>₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <span>Order #</span>
                      <span>{order._id}</span>
                    </div>
                  </div>
                  <div className="order-body">
                    {order.products.map(product => (
                      <div key={product.productId} className="product-in-order">
                        <img src={product.image} alt={product.title} />
                        <div className="product-order-details">
                          <h4>{product.title}</h4>
                          <p>Size: {product.size}</p>
                          <p>Quantity: {product.quantity}</p>
                          <p>Price: ₹{product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyOrders;
