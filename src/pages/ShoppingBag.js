import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

function ShoppingBag() {
  const { shoppingBag, setShoppingBag } = useContext(AppContext);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }
    
    const updatedBag = shoppingBag.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setShoppingBag(updatedBag);
  };

  const removeItem = (index) => {
    const updatedBag = shoppingBag.filter((_, i) => i !== index);
    setShoppingBag(updatedBag);
  };

  const calculateTotal = () => {
    return shoppingBag.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateSavings = () => {
    return shoppingBag.reduce((savings, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return savings + ((item.originalPrice - item.price) * item.quantity);
      }
      return savings;
    }, 0);
  };

  return (
    <div className="min-h-screen py-8 md:py-12 lg:py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Shopping Bag
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {shoppingBag.length} {shoppingBag.length === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>

        {shoppingBag.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="mb-6 md:mb-8">
              <svg className="mx-auto w-20 h-20 sm:w-24 sm:h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">
              Your shopping bag is empty
            </h3>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm sm:text-base">
              Add some items to get started
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              Start Shopping
              <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Shopping Items */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {shoppingBag.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    
                    <img
                      src={item.backgroundImage}
                      alt={item.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="pr-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{item.title}</h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 truncate">{item.subtitle}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                            <span>Size: {item.size}</span>
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        </div>
                        <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3 sm:mt-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-base sm:text-lg font-bold text-gray-900">₹ {item.price}</span>
                          {item.originalPrice && <span className="text-xs sm:text-sm text-gray-500 line-through">₹ {item.originalPrice}</span>}
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button onClick={() => updateQuantity(index, item.quantity - 1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-sm sm:text-base">−</button>
                          <span className="text-base sm:text-lg font-medium w-6 sm:w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(index, item.quantity + 1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-sm sm:text-base">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm h-fit sticky top-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h3>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹ {calculateTotal().toFixed(2)}</span>
                </div>
                {calculateSavings() > 0 && (
                  <div className="flex justify-between text-green-600 text-sm sm:text-base">
                    <span>Savings</span>
                    <span>- ₹ {calculateSavings().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{(calculateTotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span>₹ {(calculateTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="w-full block text-center bg-gray-900 text-white py-2.5 sm:py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors mb-3 sm:mb-4 text-sm sm:text-base">
                Proceed to Checkout
              </Link>

              <Link to="/" className="block text-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingBag;
