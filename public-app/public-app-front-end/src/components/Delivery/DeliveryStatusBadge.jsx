import React from 'react';

/**
 * DeliveryStatusBadge Component
 * 
 * Displays a colored badge for delivery status.
 * Used in delivery list and detail views.
 */
const DeliveryStatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    ORDER_PLACED: {
      label: 'Order Placed',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
      icon: '📦',
    },
    DISPATCHED: {
      label: 'Dispatched',
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-800',
      icon: '🚚',
    },
    OUT_FOR_DELIVERY: {
      label: 'Out for Delivery',
      bgClass: 'bg-orange-100',
      textClass: 'text-orange-800',
      icon: '📍',
    },
    DELIVERED: {
      label: 'Delivered',
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      icon: '✅',
    },
  };

  const config = statusConfig[status] || statusConfig.ORDER_PLACED;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgClass} ${config.textClass} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

export default DeliveryStatusBadge;
