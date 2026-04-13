import React from 'react';
import { CN_STATUS_CONFIG, RETURN_TYPE_CONFIG } from '../../redux/slices/creditNoteSlice';

/**
 * Displays a single credit note as a card with key information.
 */
export default function CreditNoteCard({ creditNote, onView, onEdit, onDelete, onRequestEdit, onRequestDelete }) {
  const statusConfig = CN_STATUS_CONFIG[creditNote.status] || CN_STATUS_CONFIG.DRAFT;
  const returnTypeConfig = RETURN_TYPE_CONFIG[creditNote.returnType] || {};

  // Determine available actions based on status
  const canEdit = creditNote.status === 'DRAFT' || creditNote.status === 'EDIT_REQUESTED';
  const canDelete = creditNote.status === 'DRAFT';
  const canRequestEdit = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'READY_TO_PROCESS', 'PARTIALLY_USED'].includes(creditNote.status);
  const canRequestDelete = ['PENDING_APPROVAL', 'APPROVED', 'READY_TO_PROCESS', 'PARTIALLY_USED'].includes(creditNote.status);
  const isLocked = creditNote.status === 'FULLY_UTILIZED';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{creditNote.creditNoteId}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{creditNote.createdAt}</p>
          </div>
          <span className="text-2xl">{returnTypeConfig.icon}</span>
        </div>

        {/* Return Type */}
        <div className="mb-3">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
            {returnTypeConfig.label}
          </span>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-bold text-blue-700">
              ₹{Number(creditNote.totalAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-500">Used</p>
            <p className="text-sm font-bold text-green-700">
              ₹{Number(creditNote.usedAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-sm font-bold text-amber-700">
              ₹{Number(creditNote.remainingAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Items count */}
        <p className="text-xs text-gray-500 mb-3">
          {creditNote.items?.length || 0} item(s) &bull; Invoice: {creditNote.invoiceNumber || 'N/A'}
        </p>

        {/* Validity info */}
        {(creditNote.status === 'READY_TO_PROCESS' || creditNote.status === 'PARTIALLY_USED') && creditNote.validityDate && (
          <div className="text-xs text-gray-500 mb-3">
            Valid until: <span className="font-medium">{creditNote.validityDate}</span>
          </div>
        )}

        {/* Locked notice */}
        {isLocked && (
          <div className="bg-gray-100 rounded-lg p-2 text-xs text-gray-600 mb-3 text-center">
            🔒 Fully utilized — No changes allowed
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(creditNote)}
            className="flex-1 py-1.5 px-3 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View Details
          </button>

          {canEdit && (
            <button
              onClick={() => onEdit(creditNote)}
              className="py-1.5 px-3 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(creditNote)}
              className="py-1.5 px-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}

          {canRequestEdit && (
            <button
              onClick={() => onRequestEdit(creditNote)}
              className="py-1.5 px-3 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              title="Request Edit"
            >
              ✏️ Request
            </button>
          )}

          {canRequestDelete && (
            <button
              onClick={() => onRequestDelete(creditNote)}
              className="py-1.5 px-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Request Delete"
            >
              🗑️ Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
