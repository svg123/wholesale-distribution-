import React from 'react';
import { FiUsers, FiCheckCircle, FiPause, FiAlertTriangle } from 'react-icons/fi';

const cards = [
  {
    key: 'total',
    label: 'Total Employees',
    icon: FiUsers,
    bg: 'bg-gray-50',
    iconColor: 'text-gray-600',
    ring: 'ring-gray-200',
    valueColor: 'text-gray-900',
  },
  {
    key: 'working',
    label: 'Currently Working',
    icon: FiCheckCircle,
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    ring: 'ring-green-200',
    valueColor: 'text-green-700',
  },
  {
    key: 'onLeave',
    label: 'On Leave',
    icon: FiPause,
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    ring: 'ring-red-200',
    valueColor: 'text-red-700',
  },
  {
    key: 'idle',
    label: 'Idle / Not Active',
    icon: FiAlertTriangle,
    bg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    ring: 'ring-yellow-200',
    valueColor: 'text-yellow-700',
  },
];

export default function OverviewCards({ employees }) {
  const counts = {
    total: employees.length,
    working: employees.filter((e) => e.status === 'WORKING').length,
    onLeave: employees.filter((e) => e.status === 'ON_LEAVE').length,
    idle: employees.filter((e) => e.status === 'IDLE').length,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.key} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${c.valueColor}`}>{counts[c.key]}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} ${c.iconColor} ring-1 ${c.ring}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
