import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import OrderSelector from '../components/TrackOrder/OrderSelector';
import OrderTimeline from '../components/TrackOrder/OrderTimeline';
import DeliveryInfo from '../components/TrackOrder/DeliveryInfo';
import TrackingMap from '../components/TrackOrder/TrackingMap';

/**
 * TrackOrder Page
 * 
 * Displays real-time order tracking with:
 * - Order selector (dropdown or search)
 * - Timeline of order status updates
 * - Current delivery information
 * - Map showing delivery location
 * - Estimated delivery date
 * 
 * Features:
 * - Select from past orders
 * - View detailed status timeline
 * - See current location/status
 * - Mobile responsive design
 */
const TrackOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { orders } = useSelector(state => state.order);

  // State for tracking
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get initial order from search params or use first order
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrderId(orderId);
        setSelectedOrder(order);
      }
    } else if (orders.length > 0) {
      // Default to first order
      setSelectedOrderId(orders[0].id);
      setSelectedOrder(orders[0]);
    }
  }, [isAuthenticated, navigate, searchParams, orders]);

  // Handle order selection
  const handleSelectOrder = (orderId) => {
    setIsLoading(true);
    setSelectedOrderId(orderId);
    
    // Simulate fetching order details
    setTimeout(() => {
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track Order</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor your order status in real-time
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Selector */}
        <div className="mb-8">
          <OrderSelector
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={handleSelectOrder}
            isLoading={isLoading}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4 animate-spin">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6" />
                </svg>
              </div>
              <p className="text-gray-500">Loading order details...</p>
            </div>
          </div>
        ) : selectedOrder ? (
          <div className="space-y-8">
            {/* Grid Layout: Desktop 2 columns, Mobile 1 column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timeline Section - 2 columns on desktop */}
              <div className="lg:col-span-2">
                <OrderTimeline order={selectedOrder} />
              </div>

              {/* Delivery Info Section - 1 column */}
              <div>
                <DeliveryInfo order={selectedOrder} />
              </div>
            </div>

            {/* Map Section - Full width */}
            {selectedOrder.status !== 'CANCELLED' && (
              <TrackingMap order={selectedOrder} />
            )}

            {/* Additional Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-medium transition">
                  📞 Contact Support
                </button>
                <button className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-medium transition">
                  📧 Share Tracking Link
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No orders available to track</p>
            <button
              onClick={() => navigate('/order-history')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View Order History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
