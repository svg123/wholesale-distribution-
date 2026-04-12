import React, { useState } from 'react';

export default function OutstandingBalance({ data, isExpanded, onToggleExpand }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(data.outstanding);

  // Format date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Calculate payment percentage
  const paymentPercentage = (data.paid / data.amount) * 100;

  // Get status color and label
  const getStatusColor = () => {
    if (data.status === 'paid') return 'bg-green-100 text-green-800 border-green-300';
    if (data.status === 'overdue') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getStatusLabel = () => {
    if (data.status === 'paid') return '✓ Paid';
    if (data.status === 'overdue') return '⚠ Overdue';
    return '⏱ Pending';
  };

  const getDaysLabel = () => {
    if (data.status === 'paid') return 'Paid';
    if (data.days > 30) return `${data.days} days ago`;
    if (data.days > 0) return `Due in ${data.days} days`;
    return 'Due today';
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Handle payment submission
    console.log(`Payment of ₹${paymentAmount} submitted for ${data.invoiceNumber}`);
    setShowPaymentForm(false);
  };

  return (
    <div className="hover:bg-gray-50 transition-colors">
      {/* Main Row */}
      <div
        className="p-6 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-6">
          {/* Expand Icon */}
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Invoice Number and Dates */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {data.invoiceNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                {getStatusLabel()}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Order: {formatDate(data.orderDate)}</span>
              <span>Due: {formatDate(data.dueDate)}</span>
              <span className="font-medium text-gray-700">{getDaysLabel()}</span>
            </div>
          </div>

          {/* Amount Section */}
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-gray-900">
              ₹{(data.outstanding / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Outstanding of ₹{(data.amount / 1000).toFixed(1)}K
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 ml-11">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                data.status === 'paid'
                  ? 'bg-green-500'
                  : data.status === 'overdue'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${paymentPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Paid: ₹{(data.paid / 1000).toFixed(1)}K</span>
            <span>{paymentPercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Left Column - Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Invoice Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice ID:</span>
                  <span className="font-medium text-gray-900">{data.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium text-gray-900">{data.items} products</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(data.orderDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(data.dueDate)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {data.notes && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{data.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column - Payment Summary */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Payment Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-3 border-b border-gray-300">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-gray-900">
                    ₹{(data.amount / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-300">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    ₹{(data.paid / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-300">
                  <span className="text-gray-600">Outstanding:</span>
                  <span className={`font-bold ${
                    data.outstanding === 0
                      ? 'text-green-600'
                      : data.status === 'overdue'
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}>
                    ₹{(data.outstanding / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>

              {/* Payment Percentage Detailed */}
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Payment Progress</div>
                <div className="w-full bg-gray-300 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      data.status === 'paid'
                        ? 'bg-green-500'
                        : data.status === 'overdue'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${paymentPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {paymentPercentage.toFixed(0)}% completed
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {data.outstanding > 0 ? (
              <>
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  {showPaymentForm ? '✕ Cancel' : '+ Record Payment'}
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">
                  📧 Send Reminder
                </button>
              </>
            ) : (
              <div className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg text-center font-medium text-sm border border-green-200">
                ✓ Invoice Paid
              </div>
            )}
          </div>

          {/* Payment Form */}
          {showPaymentForm && data.outstanding > 0 && (
            <div className="mt-6 p-4 bg-white border border-gray-300 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-4">Record Payment</h5>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={data.outstanding}
                      step="100"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Max: ₹{(data.outstanding / 1000).toFixed(1)}K
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>NEFT/RTGS</option>
                    <option>Card Payment</option>
                    <option>UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CHQ-2026-001, TXN-ID-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                >
                  Confirm Payment
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
