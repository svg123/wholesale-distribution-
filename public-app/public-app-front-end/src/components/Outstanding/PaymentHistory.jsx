import React, { useState, useMemo } from 'react';

export default function PaymentHistory({ data }) {
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'date-desc',
  });

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatCurrency = (amount) => {
    return (amount / 1000).toFixed(1) + 'K';
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Sort data
    if (filters.sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    } else if (filters.sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
    } else if (filters.sortBy === 'amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    }

    return filtered;
  }, [filters]);

  // Calculate summary
  const summary = useMemo(() => {
    return {
      totalPayments: data.length,
      totalAmount: data.reduce((sum, item) => sum + item.amount, 0),
      completedPayments: data.filter((item) => item.status === 'completed').length,
    };
  }, [data]);

  const getMethodColor = (method) => {
    const colors = {
      'Bank Transfer': 'bg-blue-100 text-blue-800',
      'Cheque': 'bg-purple-100 text-purple-800',
      'NEFT': 'bg-indigo-100 text-indigo-800',
      'RTGS': 'bg-cyan-100 text-cyan-800',
      'Card Payment': 'bg-orange-100 text-orange-800',
      'UPI': 'bg-green-100 text-green-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {/* Summary Section */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {summary.totalPayments}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Amount Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₹{formatCurrency(summary.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Successful Payments</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {summary.completedPayments}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{filteredData.length}</span> payments
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Payment Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((payment, index) => (
                <tr key={payment.id} className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(payment.paymentDate)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(payment.paymentDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {payment.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ₹{formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(payment.method)}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {payment.reference}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.status === 'completed' ? (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm font-medium text-green-700">
                          Completed
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-yellow-700">
                          Pending
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-600">No payments found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Download Section */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm0 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5" />
            </svg>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
