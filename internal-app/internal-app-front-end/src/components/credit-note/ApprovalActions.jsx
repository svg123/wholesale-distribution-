import React, { useState } from 'react';
import PartialApproval from './PartialApproval';

/**
 * Approval/Rejection action dialog with mandatory comments.
 */
export default function ApprovalActions({
  type,
  creditNote,
  onClose,
  onApprove,
  onReject,
  onMarkReady,
  onHandleEdit,
  onHandleDelete,
  isLoading = false,
}) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [showPartial, setShowPartial] = useState(false);
  const [partialItems, setPartialItems] = useState([]);

  if (!type) return null;

  const isApprove = type === 'approve';
  const isReject = type === 'reject';
  const isReady = type === 'ready';
  const isEditApprove = type === 'edit-approve';
  const isEditReject = type === 'edit-reject';
  const isDeleteApprove = type === 'delete-approve';
  const isDeleteReject = type === 'delete-reject';

  const requiresComment = isReject || isEditReject || isDeleteReject || isEditApprove || isDeleteApprove;
  const title = isApprove ? 'Approve Credit Note'
    : isReject ? 'Reject Credit Note'
    : isReady ? 'Mark Ready to Process'
    : isEditApprove ? 'Approve Edit Request'
    : isEditReject ? 'Reject Edit Request'
    : isDeleteApprove ? 'Approve Delete Request'
    : 'Reject Delete Request';

  const description = isApprove
    ? 'Review and approve this credit note. You can approve all items or adjust quantities.'
    : isReject
    ? 'Reject this credit note. A mandatory comment is required.'
    : isReady
    ? 'Mark this credit note as Ready-to-Process. The pharmacist will be able to use it in billing.'
    : isEditApprove
    ? 'Approve the edit request. The pharmacist will be able to modify this credit note.'
    : isEditReject
    ? 'Reject the edit request. Provide a reason for rejection.'
    : isDeleteApprove
    ? 'This will permanently delete the credit note. This action cannot be undone.'
    : 'Reject the delete request. The credit note will remain active.';

  const handleSubmit = () => {
    if (requiresComment && !comment.trim()) {
      setError('Comment is required');
      return;
    }

    const payload = { comment: comment.trim() };

    if (isApprove) {
      if (showPartial && partialItems.length > 0) {
        payload.items = partialItems;
      }
      onApprove(creditNote.id, payload);
    } else if (isReject) {
      onReject(creditNote.id, payload);
    } else if (isReady) {
      onMarkReady(creditNote.id, payload);
    } else if (isEditApprove) {
      onHandleEdit(creditNote.id, { ...payload, action: 'approve' });
    } else if (isEditReject) {
      onHandleEdit(creditNote.id, { ...payload, action: 'reject' });
    } else if (isDeleteApprove) {
      onHandleDelete(creditNote.id, { ...payload, action: 'approve' });
    } else if (isDeleteReject) {
      onHandleDelete(creditNote.id, { ...payload, action: 'reject' });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isApprove || isReady || isEditApprove ? 'bg-green-100'
              : isReject || isEditReject || isDeleteReject ? 'bg-red-100'
              : 'bg-red-100'
            }`}>
              <span className="text-xl">
                {isApprove || isReady || isEditApprove ? '✅' : '⚠️'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{creditNote.creditNoteId}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{description}</p>

          {/* Partial Approval Toggle (only for approve) */}
          {isApprove && creditNote.items?.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPartial}
                  onChange={(e) => setShowPartial(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Adjust quantities (Partial Approval)</span>
              </label>

              {showPartial && (
                <PartialApproval
                  items={creditNote.items}
                  onItemsChange={setPartialItems}
                />
              )}
            </div>
          )}

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment {requiresComment && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder={
                requiresComment
                  ? 'Provide a reason...'
                  : 'Add a comment (optional)...'
              }
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (requiresComment && !comment.trim())}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              isApprove || isReady || isEditApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Processing...' : isApprove ? 'Approve' : isReject ? 'Reject' : isReady ? 'Confirm' : isDeleteApprove ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
