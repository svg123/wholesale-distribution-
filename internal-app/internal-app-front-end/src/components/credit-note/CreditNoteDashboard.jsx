import React from 'react';
import { CN_STATUS_CONFIG } from '../../redux/slices/creditNoteSlice';

/**
 * Dashboard overview cards showing credit note stats across statuses.
 */
export default function CreditNoteDashboard({ stats = {}, onViewByStatus }) {
  const cards = [
    {
      label: 'Draft',
      value: stats.draft || 0,
      status: 'DRAFT',
      color: 'gray',
      bgClass: 'bg-gray-50',
      borderClass: 'border-gray-200',
      icon: '📝',
    },
    {
      label: 'Pending Approval',
      value: stats.pendingApproval || 0,
      status: 'PENDING_APPROVAL',
      color: 'yellow',
      bgClass: 'bg-yellow-50',
      borderClass: 'border-yellow-200',
      icon: '⏳',
    },
    {
      label: 'Approved',
      value: stats.approved || 0,
      status: 'APPROVED',
      color: 'blue',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      icon: '✅',
    },
    {
      label: 'Ready to Process',
      value: stats.readyToProcess || 0,
      status: 'READY_TO_PROCESS',
      color: 'green',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      icon: '🚀',
    },
    {
      label: 'Partially Used',
      value: stats.partiallyUsed || 0,
      status: 'PARTIALLY_USED',
      color: 'indigo',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-200',
      icon: '🔄',
    },
    {
      label: 'Fully Utilized',
      value: stats.fullyUtilized || 0,
      status: 'FULLY_UTILIZED',
      color: 'emerald',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
      icon: '✓',
    },
    {
      label: 'Edit Requested',
      value: stats.editRequested || 0,
      status: 'EDIT_REQUESTED',
      color: 'purple',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200',
      icon: '✏️',
    },
    {
      label: 'Delete Requested',
      value: stats.deleteRequested || 0,
      status: 'DELETE_REQUESTED',
      color: 'pink',
      bgClass: 'bg-pink-50',
      borderClass: 'border-pink-200',
      icon: '🗑️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Credit Issued</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{Number(stats.totalCreditAmount || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Used</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ₹{Number(stats.totalUsedAmount || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Remaining</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ₹{Number(stats.totalRemainingAmount || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Needs Attention</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {(stats.pendingApproval || 0) + (stats.editRequested || 0) + (stats.deleteRequested || 0)}
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.status}
              onClick={() => onViewByStatus?.(card.status)}
              className={`${card.bgClass} border ${card.borderClass} rounded-lg p-4 text-left hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-2xl font-bold ${card.color === 'gray' ? 'text-gray-700' : card.color === 'yellow' ? 'text-yellow-700' : card.color === 'blue' ? 'text-blue-700' : card.color === 'green' ? 'text-green-700' : card.color === 'indigo' ? 'text-indigo-700' : card.color === 'emerald' ? 'text-emerald-700' : card.color === 'purple' ? 'text-purple-700' : 'text-pink-700'}`}>
                  {card.value}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">{card.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
