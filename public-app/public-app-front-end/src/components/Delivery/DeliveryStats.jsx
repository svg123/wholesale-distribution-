import React from 'react';

/**
 * DeliveryStats Component
 * 
 * Shows summary cards for delivery statistics:
 * - Total deliveries
 * - Active (dispatched + out for delivery)
 * - Delivered
 */
const DeliveryStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Deliveries',
      value: stats.total,
      icon: '📦',
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-800',
      iconBgClass: 'bg-gray-200',
    },
    {
      label: 'Pending',
      value: stats.orderPlaced,
      icon: '⏳',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-800',
      iconBgClass: 'bg-blue-200',
    },
    {
      label: 'Dispatched',
      value: stats.dispatched,
      icon: '🚚',
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-800',
      iconBgClass: 'bg-purple-200',
    },
    {
      label: 'Out for Delivery',
      value: stats.outForDelivery,
      icon: '📍',
      bgClass: 'bg-orange-50',
      textClass: 'text-orange-800',
      iconBgClass: 'bg-orange-200',
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: '✅',
      bgClass: 'bg-green-50',
      textClass: 'text-green-800',
      iconBgClass: 'bg-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgClass} rounded-lg p-4 border border-gray-100`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 ${stat.iconBgClass} rounded-lg flex items-center justify-center text-sm`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveryStats;
