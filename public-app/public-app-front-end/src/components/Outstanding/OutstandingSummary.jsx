import React from 'react';

export default function OutstandingSummary({ summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Outstanding */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Outstanding</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(summary.totalOutstanding / 100000).toFixed(2)}L
            </p>
            <p className="text-xs text-gray-600 mt-2">
              From {summary.pendingCount + summary.overdueCount} invoices
            </p>
          </div>
          <div className="text-red-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Overdue Amount */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Overdue Amount</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(summary.overdueAmount / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {summary.overdueCount} overdue invoices
            </p>
          </div>
          <div className="text-orange-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zm-5-6a.75.75 0 00-.75.75v5.5a.75.75 0 001.5 0v-5.5A.75.75 0 008 2zM4 20a.75.75 0 00.75-.75v-5.5a.75.75 0 00-1.5 0v5.5c0 .414.336.75.75.75z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Due Soon */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Due Soon</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(summary.pendingAmount / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {summary.pendingCount} pending invoices
            </p>
          </div>
          <div className="text-yellow-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Paid */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Paid</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(summary.totalPaid / 100000).toFixed(2)}L
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {summary.paidCount} invoices paid
            </p>
          </div>
          <div className="text-green-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
