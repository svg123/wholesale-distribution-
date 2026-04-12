import React from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiDollarSign,
  FiAlertCircle,
} from 'react-icons/fi';

const iconMap = {
  orders: FiPackage,
  pending: FiClock,
  completed: FiCheckCircle,
  dispatched: FiTruck,
  revenue: FiDollarSign,
  alert: FiAlertCircle,
  trending_up: FiTrendingUp,
  trending_down: FiTrendingDown,
};

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-600/10' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', ring: 'ring-green-600/10' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', ring: 'ring-yellow-600/10' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-600/10' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-600/10' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-600/10' },
};

export default function StatCard({ title, value, subtitle, icon, color = 'blue', trend }) {
  const Icon = iconMap[icon] || FiPackage;
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend)}% from last period</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-xl ring-1 ${colors.ring} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
