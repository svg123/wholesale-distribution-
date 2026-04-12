import React from 'react';

export default function OrderStatusBadge({ status }) {
  const statusConfig = {
    PENDING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pending',
      icon: '⏳',
    },
    CONFIRMED: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Confirmed',
      icon: '✓',
    },
    SHIPPED: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Shipped',
      icon: '🚚',
    },
    DELIVERED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Delivered',
      icon: '✓✓',
    },
    CANCELLED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Cancelled',
      icon: '✗',
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}
