import React from 'react';

/**
 * DeliveryInfo Component
 * 
 * Displays key delivery information:
 * - Estimated delivery date
 * - Delivery address
 * - Delivery contact
 * - Current status with percentage
 * - Quick actions (help, reschedule)
 */
const DeliveryInfo = ({ order }) => {
  // Calculate progress percentage based on status
  const getProgressPercentage = () => {
    const statusProgress = {
      PENDING: 20,
      CONFIRMED: 40,
      SHIPPED: 60,
      OUT_FOR_DELIVERY: 80,
      DELIVERED: 100,
      CANCELLED: 0,
    };
    return statusProgress[order.status] || 0;
  };

  // Status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-50 border-yellow-200' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-50 border-blue-200' },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', badge: 'bg-purple-50 border-purple-200' },
      OUT_FOR_DELIVERY: { bg: 'bg-indigo-100', text: 'text-indigo-800', badge: 'bg-indigo-50 border-indigo-200' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-50 border-green-200' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-50 border-red-200' },
    };
    return colors[status] || colors.PENDING;
  };

  const colors = getStatusColor(order.status);
  const progress = getProgressPercentage();

  return (
    <div className="space-y-4">
      {/* Current Status Card */}
      <div className={`rounded-lg border border-gray-200 p-6 ${colors.badge}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Current Status
            </p>
            <h3 className={`text-2xl font-bold ${colors.text}`}>
              {order.status}
            </h3>
          </div>
          <span className="text-2xl">
            {order.status === 'PENDING' && '⏳'}
            {order.status === 'CONFIRMED' && '✓'}
            {order.status === 'SHIPPED' && '🚚'}
            {order.status === 'OUT_FOR_DELIVERY' && '📍'}
            {order.status === 'DELIVERED' && '✓✓'}
            {order.status === 'CANCELLED' && '✗'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${
                order.status === 'DELIVERED'
                  ? 'bg-green-500'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              } transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-right">
            {progress}% complete
          </p>
        </div>
      </div>

      {/* Estimated Delivery Date */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          📅 Estimated Delivery
        </p>
        <p className="text-lg font-semibold text-gray-900">
          {order.estimatedDelivery || 'Mar 20, 2026'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {order.status === 'DELIVERED' && '✓ Delivered on time'}
          {order.status === 'OUT_FOR_DELIVERY' && 'Today between 10AM - 4PM'}
          {order.status === 'SHIPPED' && 'Expected within 2 days'}
          {order.status === 'CONFIRMED' && 'Expected within 3-4 days'}
          {order.status === 'PENDING' && 'Will be confirmed soon'}
          {order.status === 'CANCELLED' && 'Order was cancelled'}
        </p>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          📍 Delivery Address
        </p>
        <p className="text-sm font-medium text-gray-900">
          {order.deliveryAddress || '123 Pharmacy Street'}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {order.city || 'Mumbai'}, {order.state || 'Maharashtra'} {order.zipCode || '400001'}
        </p>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          ☎️ Delivery Contact
        </p>
        <p className="text-sm font-medium text-gray-900">
          {order.contactPerson || 'Raj Kumar'}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {order.contactPhone || '+91 98765 43210'}
        </p>
      </div>

      {/* Quick Actions */}
      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
        <div className="space-y-2">
          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700 transition flex items-center justify-center gap-2">
            🔄 Reschedule Delivery
          </button>
          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700 transition flex items-center justify-center gap-2">
            ❓ Delivery Help
          </button>
        </div>
      )}

      {/* Delivered Actions */}
      {order.status === 'DELIVERED' && (
        <div className="space-y-2">
          <button className="w-full px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm transition flex items-center justify-center gap-2">
            ⭐ Rate Delivery
          </button>
          <button className="w-full px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm transition flex items-center justify-center gap-2">
            🔄 Reorder
          </button>
        </div>
      )}

      {/* Cancelled Actions */}
      {order.status === 'CANCELLED' && (
        <button className="w-full px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm transition flex items-center justify-center gap-2">
          💬 Contact Support
        </button>
      )}
    </div>
  );
};

export default DeliveryInfo;
