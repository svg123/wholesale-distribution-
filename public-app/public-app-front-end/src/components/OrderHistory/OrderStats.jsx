import React from 'react';

export default function OrderStats({ orders = [] }) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
  const confirmedOrders = orders.filter(order => order.status === 'CONFIRMED').length;
  const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length;
  const totalValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: '📦',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Pending',
      value: pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Confirmed',
      value: confirmedOrders,
      icon: '✓',
      color: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      label: 'Delivered',
      value: deliveredOrders,
      icon: '🚚',
      color: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className={`card ${stat.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
