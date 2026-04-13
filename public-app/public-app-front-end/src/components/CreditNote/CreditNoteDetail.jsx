import React, { useState } from 'react';
import { CN_STATUS_CONFIG, RETURN_TYPE_CONFIG } from '../../redux/slices/creditNoteSlice';
import CreditNoteUsageHistory from './CreditNoteUsageHistory';

/**
 * Full detail view of a single credit note.
 */
export default function CreditNoteDetail({ creditNote, onClose, onRequestEdit, onRequestDelete }) {
  const [activeTab, setActiveTab] = useState('details');

  if (!creditNote) return null;

  const statusConfig = CN_STATUS_CONFIG[creditNote.status] || CN_STATUS_CONFIG.DRAFT;
  const returnTypeConfig = RETURN_TYPE_CONFIG[creditNote.returnType] || {};

  const canRequestEdit = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'READY_TO_PROCESS', 'PARTIALLY_USED'].includes(creditNote.status);
  const canRequestDelete = ['PENDING_APPROVAL', 'APPROVED', 'READY_TO_PROCESS', 'PARTIALLY_USED'].includes(creditNote.status);
  const isLocked = creditNote.status === 'FULLY_UTILIZED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Credit Note: {creditNote.creditNoteId}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Created: {creditNote.createdAt}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'items'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Items ({creditNote.items?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Return Type</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    {returnTypeConfig.icon} {returnTypeConfig.label}
                  </span>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Credit</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{Number(creditNote.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Used</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{Number(creditNote.usedAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{Number(creditNote.remainingAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Invoice Reference</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invoice Number</span>
                    <span className="font-medium">{creditNote.invoiceNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invoice Date</span>
                    <span className="font-medium">{creditNote.invoiceDate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Approval Timeline */}
              {creditNote.approvalLogs && creditNote.approvalLogs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Approval Timeline</h4>
                  <div className="space-y-3">
                    {creditNote.approvalLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          log.action === 'APPROVED' || log.action === 'READY_TO_PROCESS'
                            ? 'bg-green-500'
                            : log.action === 'REJECTED'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{log.action}</span> by {log.by}
                          </p>
                          <p className="text-xs text-gray-500">{log.date}</p>
                          {log.comment && (
                            <p className="text-xs text-gray-500 mt-1 italic">"{log.comment}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {creditNote.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{creditNote.notes}</p>
                </div>
              )}

              {/* Validity */}
              {(creditNote.status === 'READY_TO_PROCESS' || creditNote.status === 'PARTIALLY_USED') && creditNote.validityDate && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  ⏰ Credit note valid until: <strong>{creditNote.validityDate}</strong>
                </div>
              )}

              {/* Locked Notice */}
              {isLocked && (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm text-gray-600 text-center">
                  🔒 This credit note has been fully utilized and is locked.
                </div>
              )}
            </div>
          )}

          {activeTab === 'items' && (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Product</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Batch</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600">Qty</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Unit Price</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {creditNote.items?.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-3 py-2">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.companyName}</p>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{item.batchNumber}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'history' && (
            <CreditNoteUsageHistory usageHistory={creditNote.usageHistory || []} />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {canRequestEdit && (
              <button
                onClick={() => onRequestEdit(creditNote)}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
              >
                Request Edit
              </button>
            )}
            {canRequestDelete && (
              <button
                onClick={() => onRequestDelete(creditNote)}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
              >
                Request Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
