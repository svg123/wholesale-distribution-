import React from 'react';

/**
 * DeliveryDetailPanel Component
 * 
 * Full detail view of a delivery showing:
 * - Order info (ID, date, items, amount)
 * - Delivery address
 * - Assigned delivery person with contact
 * - Dispatch & delivery timestamps
 * - Remarks/notes
 * - Expected delivery time
 */
const DeliveryDetailPanel = ({ delivery }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Delivery Details</h2>

      {/* Order Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order ID</p>
          <p className="text-sm font-mono font-semibold text-blue-600 mt-1">{delivery.orderId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order Date</p>
          <p className="text-sm font-medium text-gray-800 mt-1">
            {new Date(delivery.orderDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Items</p>
          <p className="text-sm font-medium text-gray-800 mt-1">{delivery.items} items</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Amount</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">{formatCurrency(delivery.totalAmount)}</p>
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
          📍 Delivery Address
        </p>
        <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{delivery.deliveryAddress}</p>
      </div>

      {/* Delivery Person */}
      {delivery.deliveryPerson ? (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-2">
            👤 Delivery Agent
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">{delivery.deliveryPerson.name}</p>
            </div>
            <p className="text-xs text-gray-600">
              📞 {delivery.deliveryPerson.phone}
            </p>
            <p className="text-xs text-gray-600">
              🏍️ {delivery.deliveryPerson.vehicle}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-xs text-amber-600">
            ⏳ Delivery agent will be assigned shortly.
          </p>
        </div>
      )}

      {/* Timeline Information */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Dispatch Time</span>
          <span className="font-medium text-gray-800">{formatDateTime(delivery.dispatchTime)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Expected Delivery</span>
          <span className="font-medium text-gray-800">
            {formatDateTime(delivery.expectedDeliveryTime)}
          </span>
        </div>
        {delivery.deliveredTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Delivered At</span>
            <span className="font-medium text-green-700">
              {formatDateTime(delivery.deliveredTime)}
            </span>
          </div>
        )}
      </div>

      {/* Remarks */}
      {delivery.remarks && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-600 mb-1">📝 Remarks</p>
          <p className="text-sm text-amber-800">{delivery.remarks}</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryDetailPanel;
