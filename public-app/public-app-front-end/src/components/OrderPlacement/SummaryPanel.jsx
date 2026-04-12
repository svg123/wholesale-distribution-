import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder, clearCart, resetOrderPlaced } from '../../redux/slices/orderPlacementSlice';

const SummaryPanel = () => {
  const dispatch = useDispatch();
  const { summary, cart, orderPlaced, lastOrderSummary } = useSelector((state) => state.orderPlacement);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add products to place an order.');
      return;
    }

    const confirmed = window.confirm(
      `Confirm order placement?\n\nTotal Items: ${summary.totalItems}\nGrand Total: ₹${summary.grandTotal.toFixed(2)}`
    );

    if (confirmed) {
      setIsPlacingOrder(true);
      // Simulate API call
      setTimeout(() => {
        dispatch(placeOrder());
        setIsPlacingOrder(false);
      }, 1000);
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear all items from the cart? This action cannot be undone.'
    );

    if (confirmed) {
      dispatch(clearCart());
    }
  };

  // Success Modal
  if (orderPlaced) {
    // Use lastOrderSummary which was saved before clearing the cart
    const displaySummary = lastOrderSummary || summary;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative">
          {/* Close Button */}
          <button
            onClick={() => dispatch(resetOrderPlaced())}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-200 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <div className="flex items-center justify-center">
              <div className="bg-white rounded-full p-3">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been received and is being processed. You will receive a confirmation shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Order Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{displaySummary.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-semibold">{displaySummary.totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free Quantity:</span>
                  <span className="font-semibold text-green-600">{displaySummary.totalFreeQuantity}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-900">Grand Total:</span>
                  <span className="font-bold text-blue-600 text-lg">₹{displaySummary.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => dispatch(resetOrderPlaced())}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       font-semibold transition-colors"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden sticky top-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Order Summary
        </h3>
      </div>

      <div className="p-6">
        {/* Summary Items */}
        <div className="space-y-4 mb-6">
          {/* Total Items */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalItems}</p>
              </div>
            </div>
          </div>

          {/* Total Quantity */}
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalQuantity}</p>
              </div>
            </div>
          </div>

          {/* Free Quantity */}
          {summary.totalFreeQuantity > 0 && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Free Quantity</p>
                  <p className="text-2xl font-bold text-green-600">{summary.totalFreeQuantity}</p>
                </div>
              </div>
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                BONUS
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-base font-semibold text-gray-900">
              ₹{summary.subtotal.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total GST</span>
            <span className="text-base font-semibold text-gray-900">
              ₹{summary.totalGst.toFixed(2)}
            </span>
          </div>
          
          <div className="pt-3 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Grand Total</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{summary.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Display */}
        {summary.totalFreeQuantity > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-sm font-semibold text-orange-800">You're Saving!</span>
            </div>
            <p className="text-xs text-gray-700">
              You're getting <strong>{summary.totalFreeQuantity} free units</strong> worth extra value with this order!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || isPlacingOrder}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all 
                     flex items-center justify-center gap-2 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 ${
                       cart.length === 0
                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                         : isPlacingOrder
                         ? 'bg-blue-400 text-white cursor-wait'
                         : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl'
                     }`}
          >
            {isPlacingOrder ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Order...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M5 13l4 4L19 7" />
                </svg>
                Place Order
              </>
            )}
          </button>

          <button
            onClick={handleClearCart}
            disabled={cart.length === 0}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors 
                     flex items-center justify-center gap-2 ${
                       cart.length === 0
                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                         : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
                     }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Cart
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-gray-700">
              <p className="font-semibold mb-1">Quick Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Review your cart before placing order</li>
                <li>Free quantities are automatically added</li>
                <li>All prices include GST</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
