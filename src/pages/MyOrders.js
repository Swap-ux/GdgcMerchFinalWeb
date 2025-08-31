import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './MyOrders.css';

// Define the API URL using environment variables for flexibility
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
        const response = await fetch(`${API_URL}/api/orders`, {
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4 text-center sm:text-left">My Orders</h1>

        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Loading Your Orders...</h3>
            <p className="text-gray-600">Please wait a moment.</p>
          </div>
        )}
        
        {error && (
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">An Error Occurred</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-4-4m-4 4l-4-4m8 4l-4 4m-4-4l-4 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600">You haven't placed any orders with us yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="space-y-2 sm:space-y-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 mr-2">Order Placed:</span>
                            <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 mr-2">Total:</span>
                            <span className="text-sm font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 mr-2">Order #:</span>
                          <span className="text-sm text-gray-700 font-mono truncate max-w-[120px] sm:max-w-xs">
                            {order._id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="space-y-6">
                        {order.products.map(product => (
                          <div key={product.productId} className="flex flex-col sm:flex-row gap-4 pb-6 last:pb-0 border-b border-gray-100 last:border-b-0">
                            <img 
                              src={product.image} 
                              alt={product.title} 
                              className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-gray-900 mb-2 truncate">{product.title}</h4>
                              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-sm text-gray-600">
                                <p>Size: <span className="font-medium">{product.size}</span></p>
                                <p>Quantity: <span className="font-medium">{product.quantity}</span></p>
                                <p className="xs:col-span-2">Price: <span className="font-medium">₹{product.price.toFixed(2)}</span></p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
