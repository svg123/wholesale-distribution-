import React from 'react';
import DeliveryStatusBadge from './DeliveryStatusBadge';

/**
 * DeliveryStatusTimeline Component
 * 
 * Displays a visual timeline of delivery progress with:
 * - Order Placed → Dispatched → Out for Delivery → Delivered
 * - Shows completed, current, and pending steps
 * - Includes timestamps for completed steps
 */
const DeliveryStatusTimeline = ({ delivery }) => {
  const steps = [
    {
      key: 'ORDER_PLACED',
      label: 'Order Placed',
      description: 'Your order has been received',
      time: delivery.createdAt,
      icon: '📦',
    },
    {
      key: 'DISPATCHED',
      label: 'Dispatched',
      description: 'Order dispatched from warehouse',
      time: delivery.dispatchTime,
      icon: '🚚',
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      description: 'On the way to your pharmacy',
      time: delivery.dispatchTime
        ? delivery.status === 'OUT_FOR_DELIVERY'
          ? delivery.updatedAt
          : null
        : null,
      icon: '📍',
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Successfully delivered',
      time: delivery.deliveredTime,
      icon: '✅',
    },
  ];

  const statusOrder = ['ORDER_PLACED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = statusOrder.indexOf(delivery.status);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Timeline</h2>

      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Timeline Line + Dot */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                {/* Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[40px] my-1 ${
                      isCompleted ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-8 ${index === steps.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold ${
                      isCompleted
                        ? 'text-green-700'
                        : isCurrent
                        ? 'text-blue-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium animate-pulse">
                      Current
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-0.5 ${
                    isPending ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {step.description}
                </p>
                {step.time && (isCompleted || isCurrent) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(step.time)}
                  </p>
                )}
                {isCurrent && step.time && delivery.expectedDeliveryTime && (
                  <p className="text-xs text-blue-600 mt-1">
                    Expected by{' '}
                    {new Date(delivery.expectedDeliveryTime).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryStatusTimeline;
