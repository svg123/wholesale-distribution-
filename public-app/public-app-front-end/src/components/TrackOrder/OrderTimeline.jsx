import React from 'react';

/**
 * OrderTimeline Component
 * 
 * Displays timeline of order status updates:
 * - Order placed (initial status)
 * - Order confirmed
 * - Shipped
 * - Out for delivery (if applicable)
 * - Delivered
 * - Cancelled (if applicable)
 * 
 * Shows completion status with checkmarks
 * Mobile responsive timeline
 */
const OrderTimeline = ({ order }) => {
  // Define timeline events based on status
  const getTimelineEvents = () => {
    const events = [
      {
        status: 'PENDING',
        title: 'Order Placed',
        description: 'Your order has been received and is being processed',
        time: order.date,
        icon: '📦',
      },
      {
        status: 'CONFIRMED',
        title: 'Order Confirmed',
        description: 'We have confirmed your order with the pharmacy',
        time: order.confirmDate || '—',
        icon: '✓',
      },
      {
        status: 'SHIPPED',
        title: 'Shipped',
        description: 'Your order is on its way to you',
        time: order.shippedDate || '—',
        icon: '🚚',
      },
    ];

    // Add "Out for Delivery" if status is SHIPPED or beyond
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Your order is out for delivery today',
        time: order.outForDeliveryDate || '—',
        icon: '📍',
      });
    }

    // Add delivery event if delivered
    if (order.status === 'DELIVERED') {
      events.push({
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Your order has been successfully delivered',
        time: order.deliveredDate || '—',
        icon: '✓✓',
      });
    }

    // Add cancelled event if cancelled
    if (order.status === 'CANCELLED') {
      events.push({
        status: 'CANCELLED',
        title: 'Cancelled',
        description: 'Your order has been cancelled',
        time: order.cancelledDate || '—',
        icon: '✗',
      });
    }

    return events;
  };

  const events = getTimelineEvents();

  // Determine which events are completed
  const isEventCompleted = (status) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentStatusIndex = statusOrder.indexOf(order.status);
    const eventStatusIndex = statusOrder.indexOf(status);
    return eventStatusIndex <= currentStatusIndex;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Tracking Timeline</h2>

      {/* Timeline */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const isCompleted = isEventCompleted(event.status);
          const isCurrentEvent = order.status === event.status || 
            (order.status === 'OUT_FOR_DELIVERY' && event.status === 'SHIPPED');

          return (
            <div key={event.status} className="relative">
              {/* Timeline line - not shown on last item */}
              {index < events.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-1 h-12 ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Timeline item */}
              <div className="flex gap-4">
                {/* Icon circle */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold relative z-10 ${
                    isCompleted
                      ? 'bg-green-100 text-green-700'
                      : isCurrentEvent
                      ? 'bg-blue-100 text-blue-700 animate-pulse'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted && event.status !== 'CANCELLED' ? '✓' : event.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`font-semibold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {event.title}
                    </h3>
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {event.time}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {event.description}
                  </p>

                  {/* Current event indicator */}
                  {isCurrentEvent && event.status !== 'DELIVERED' && event.status !== 'CANCELLED' && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                      🔵 Current Status
                    </div>
                  )}

                  {event.status === 'DELIVERED' && order.status === 'DELIVERED' && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded">
                      ✓ Completed
                    </div>
                  )}

                  {event.status === 'CANCELLED' && order.status === 'CANCELLED' && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded">
                      ✗ Cancelled
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {order.status === 'DELIVERED' && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium text-sm">
            ✓ Your order was successfully delivered on {order.deliveredDate}
          </p>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium text-sm">
            ✗ Your order was cancelled. Please contact support for assistance.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
