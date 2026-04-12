import React from 'react';
import { FiTrendingUp, FiPackage, FiDollarSign, FiUsers } from 'react-icons/fi';
import { formatCurrency, formatNumber } from '../utils/formatters';

const monthlyData = [
  { month: 'Jan', orders: 320, revenue: 2450000 },
  { month: 'Feb', orders: 290, revenue: 2180000 },
  { month: 'Mar', orders: 350, revenue: 2890000 },
  { month: 'Apr', orders: 410, revenue: 3210000 },
];

const maxOrders = Math.max(...monthlyData.map((d) => d.orders));

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Order and revenue analytics overview</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(1247)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(10730000)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(8600)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Pharmacies</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(156)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart (Simple bar chart) */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base font-semibold text-gray-900">Monthly Orders</h3>
        </div>
        <div className="card-body">
          <div className="flex items-end gap-8 h-48 px-4">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-600">{formatNumber(d.orders)}</span>
                <div
                  className="w-full bg-primary-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(d.orders / maxOrders) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Revenue by Month</h3>
          </div>
          <div className="card-body space-y-3">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{d.month} 2026</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(d.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Order Status Distribution</h3>
          </div>
          <div className="card-body space-y-4">
            {[
              { status: 'Completed', count: 1002, total: 1247, color: 'bg-green-500' },
              { status: 'Dispatching', count: 156, total: 1247, color: 'bg-blue-500' },
              { status: 'Pending', count: 89, total: 1247, color: 'bg-yellow-500' },
            ].map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.status}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${item.color} rounded-full h-2 transition-all`}
                    style={{ width: `${(item.count / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
