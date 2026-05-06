import React from 'react';
import DeliveryStatusBadge from './DeliveryStatusBadge';

/**
 * DeliveryCard Component
 * 
 * Compact card for delivery list view showing:
 * - Order ID, status badge, date
 * - Delivery address
 * - Delivery person info
 * - Item count and amount
 * - Tap to view details
 */
const DeliveryCard = ({ delivery, onClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isActive =
    delivery.status === 'DISPATCHED' || delivery.status === 'OUT_FOR_DELIVERY';

  return (
    <button
      onClick={() => onClick(delivery)}
      className={`w-full text-left bg-white rounded-lg border transition-all hover:shadow-md ${
        isActive
          ? 'border-blue-200 hover:border-blue-300 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="p-4">
        {/* Header: Order ID + Status */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-mono font-semibold text-blue-600">
              {delivery.orderId}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(delivery.orderDate)}
            </p>
          </div>
          <DeliveryStatusBadge status={delivery.status} />
        </div>

        {/* Delivery Address */}
        <div className="flex items-start gap-2 mb-3">
          <span className="text-gray-400 mt-0.5 text-sm">📍</span>
          <p className="text-sm text-gray-700 line-clamp-1">{delivery.deliveryAddress}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-gray-400">Items</p>
            <p className="font-semibold text-gray-800">{delivery.items}</p>
          </div>
          <div>
            <p className="text-gray-400">Amount</p>
            <p className="font-semibold text-gray-800">{formatCurrency(delivery.totalAmount)}</p>
          </div>
          <div>
            <p className="text-gray-400">Expected</p>
            <p className="font-semibold text-gray-800">
              {delivery.expectedDeliveryTime
                ? formatTime(delivery.expectedDeliveryTime)
                : '—'}
            </p>
          </div>
        </div>

        {/* Delivery Person (if assigned) */}
        {delivery.deliveryPerson && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                {delivery.deliveryPerson.name}
              </p>
              <p className="text-xs text-gray-400">{delivery.deliveryPerson.vehicle}</p>
            </div>
            {isActive && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Active
              </span>
            )}
          </div>
        )}

        {/* Pending assignment */}
        {!delivery.deliveryPerson && delivery.status === 'ORDER_PLACED' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              ⏳ Awaiting dispatch...
            </p>
          </div>
        )}
      </div>
    </button>
  );
};

export default DeliveryCard;
