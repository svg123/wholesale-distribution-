import React from 'react';

/**
 * Confirmation dialog for requesting edit or delete of a credit note.
 */
export default function ConfirmRequestDialog({ isOpen, type, creditNote, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const isEdit = type === 'edit';

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this request');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isEdit ? 'bg-purple-100' : 'bg-red-100'
            }`}>
              <span className="text-xl">{isEdit ? '✏️' : '🗑️'}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {isEdit ? 'Request Edit' : 'Request Deletion'}
              </h3>
              <p className="text-sm text-gray-500">
                Credit Note: {creditNote?.creditNoteId}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {isEdit
              ? 'Your request will be sent to the internal team for approval. You can edit this credit note once the request is approved.'
              : 'Your deletion request will be sent to the internal team for approval. The credit note will be deleted once the request is approved.'}
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder={`Why do you want to ${isEdit ? 'edit' : 'delete'} this credit note?`}
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              isEdit
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? 'Submitting...' : `Submit ${isEdit ? 'Edit' : 'Delete'} Request`}
          </button>
        </div>
      </div>
    </div>
  );
}
