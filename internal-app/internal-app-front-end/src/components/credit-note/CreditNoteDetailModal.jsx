import React, { useState } from 'react';
import { CN_STATUS_CONFIG, RETURN_TYPE_CONFIG } from '../../redux/slices/creditNoteSlice';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import ApprovalActions from './ApprovalActions';
import PartialApproval from './PartialApproval';

/**
 * Modal to view credit note details and perform approval/rejection actions.
 */
export default function CreditNoteDetailModal({ creditNote, onClose, onApprove, onReject, onMarkReady, onHandleEdit, onHandleDelete, userRole }) {
  const [activeTab, setActiveTab] = useState('details');
  const [showApproval, setShowApproval] = useState(false);
  const [approvalType, setApprovalType] = useState(null); // 'approve', 'reject', 'ready', 'edit', 'delete'

  if (!creditNote) return null;

  const statusConfig = CN_STATUS_CONFIG[creditNote.status] || CN_STATUS_CONFIG.DRAFT;
  const returnTypeConfig = RETURN_TYPE_CONFIG[creditNote.returnType] || {};

  // Determine what actions are available based on status and role
  const canApprove = creditNote.status === 'PENDING_APPROVAL' && ['OPERATOR', 'MANAGEMENT', 'ADMIN'].includes(userRole);
  const canReject = creditNote.status === 'PENDING_APPROVAL' && ['OPERATOR', 'MANAGEMENT', 'ADMIN'].includes(userRole);
  const canMarkReady = creditNote.status === 'APPROVED' && ['MANAGEMENT', 'ADMIN'].includes(userRole);
  const canHandleEdit = creditNote.status === 'EDIT_REQUESTED' && ['MANAGEMENT', 'ADMIN'].includes(userRole);
  const canHandleDelete = creditNote.status === 'DELETE_REQUESTED' && ['MANAGEMENT', 'ADMIN'].includes(userRole);

  const handleAction = (type) => {
    setApprovalType(type);
    setShowApproval(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{creditNote.creditNoteId}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`}></span>
                  {statusConfig.label}
                </span>
                <span className="text-xs text-gray-500">
                  {returnTypeConfig.icon} {returnTypeConfig.label}
                </span>
              </div>
            </div>
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
          {['details', 'items', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'items' ? `Items (${creditNote.items?.length || 0})` : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Pharmacy Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Pharmacy Name</p>
                  <p className="text-sm font-semibold text-gray-900">{creditNote.pharmacyName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Area</p>
                  <p className="text-sm font-semibold text-gray-900">{creditNote.areaCode} — {creditNote.areaName}</p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Credit</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(creditNote.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Used</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(creditNote.usedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(creditNote.remainingAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Invoice Number</p>
                  <p className="text-sm font-medium text-gray-900">{creditNote.invoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Invoice Date</p>
                  <p className="text-sm font-medium text-gray-900">{creditNote.invoiceDate || 'N/A'}</p>
                </div>
              </div>

              {/* Approval Timeline */}
              {creditNote.approvalLogs && creditNote.approvalLogs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Approval Timeline</h4>
                  <div className="space-y-3 border-l-2 border-gray-200 ml-2 pl-4">
                    {creditNote.approvalLogs.map((log, i) => (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className={`absolute -left-[1.35rem] w-3 h-3 rounded-full border-2 border-white ${
                          log.action === 'APPROVED' || log.action === 'READY_TO_PROCESS'
                            ? 'bg-green-500'
                            : log.action === 'REJECTED'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}></div>
                        <div className="ml-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">{log.action}</span>
                            {' by '}
                            <span className="font-medium">{log.by}</span>
                            <span className="text-gray-400 ml-2">{formatDateTime(log.date)}</span>
                          </p>
                          {log.comment && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">"{log.comment}"</p>
                          )}
                          {log.partialApproval && (
                            <p className="text-xs text-amber-600 mt-0.5">
                              ⚠️ Partially approved — see items for details
                            </p>
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Pharmacist Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{creditNote.notes}</p>
                </div>
              )}

              {/* Validity Info */}
              {(creditNote.status === 'READY_TO_PROCESS' || creditNote.status === 'PARTIALLY_USED') && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  ⏰ Valid until: <strong>{creditNote.validityDate}</strong>
                </div>
              )}
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Product</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Batch</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600">Req. Qty</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600">Appr. Qty</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Unit Price</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Reason</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {creditNote.items?.map((item, i) => {
                    const itemStatus = item.approvedQuantity === 0 ? 'REJECTED'
                      : item.approvedQuantity === item.quantity ? 'APPROVED'
                      : item.approvedQuantity != null ? 'PARTIAL' : 'PENDING';

                    return (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.companyName}</p>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{item.batchNumber}</td>
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-center font-semibold">
                          {item.approvedQuantity != null ? item.approvedQuantity : '-'}
                        </td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrency((item.approvedQuantity || 0) * item.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 max-w-[150px] truncate">{item.reason}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            itemStatus === 'APPROVED' ? 'bg-green-100 text-green-700'
                            : itemStatus === 'REJECTED' ? 'bg-red-100 text-red-700'
                            : itemStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {itemStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {creditNote.usageHistory && creditNote.usageHistory.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Bill Number</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Amount Used</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditNote.usageHistory.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2">{formatDateTime(entry.date)}</td>
                        <td className="px-3 py-2 font-medium text-blue-600">{entry.billNumber}</td>
                        <td className="px-3 py-2 text-right text-red-600 font-medium">-{formatCurrency(entry.amountUsed)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(entry.remainingAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No usage history yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {canApprove && (
              <button
                onClick={() => handleAction('approve')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                ✓ Approve
              </button>
            )}
            {canReject && (
              <button
                onClick={() => handleAction('reject')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                ✕ Reject
              </button>
            )}
            {canMarkReady && (
              <button
                onClick={() => handleAction('ready')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🚀 Ready to Process
              </button>
            )}
            {canHandleEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction('edit-approve')}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  ✓ Approve Edit
                </button>
                <button
                  onClick={() => handleAction('edit-reject')}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  ✕ Reject Edit
                </button>
              </div>
            )}
            {canHandleDelete && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction('delete-approve')}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  🗑️ Approve Delete
                </button>
                <button
                  onClick={() => handleAction('delete-reject')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Action Panel */}
      {showApproval && (
        <ApprovalActions
          type={approvalType}
          creditNote={creditNote}
          onClose={() => setShowApproval(false)}
          onApprove={onApprove}
          onReject={onReject}
          onMarkReady={onMarkReady}
          onHandleEdit={onHandleEdit}
          onHandleDelete={onHandleDelete}
        />
      )}
    </div>
  );
}
