import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCreditNotesStart,
  fetchCreditNotesSuccess,
  fetchCreditNotesFailure,
  setCreditNoteFilters,
  setCreditNotePage,
  requestEditStart,
  requestEditSuccess,
  requestEditFailure,
  requestDeleteStart,
  requestDeleteSuccess,
  requestDeleteFailure,
  deleteCreditNoteStart,
  deleteCreditNoteSuccess,
  deleteCreditNoteFailure,
  clearError,
} from '../redux/slices/creditNoteSlice';
import creditNoteService from '../services/creditNoteService';
import CreditNoteCard from '../components/CreditNote/CreditNoteCard';
import CreditNoteList from '../components/CreditNote/CreditNoteList';
import CreditNoteDetail from '../components/CreditNote/CreditNoteDetail';
import ConfirmRequestDialog from '../components/CreditNote/ConfirmRequestDialog';
import { CN_STATUS_CONFIG } from '../redux/slices/creditNoteSlice';

export default function CreditNotes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { creditNotes, isLoading, error, filters, pagination } = useSelector((state) => state.creditNote);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);
  const [requestDialog, setRequestDialog] = useState({ isOpen: false, type: null, creditNote: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, creditNote: null });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCreditNotes();
  }, [isAuthenticated, navigate, filters, pagination.page]);

  const loadCreditNotes = () => {
    dispatch(fetchCreditNotesStart());
    creditNoteService
      .getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status !== 'all' ? filters.status : undefined,
        returnType: filters.returnType !== 'all' ? filters.returnType : undefined,
        search: filters.search || undefined,
      })
      .then((data) => dispatch(fetchCreditNotesSuccess(data)))
      .catch((err) => dispatch(fetchCreditNotesFailure(err.message)));
  };

  const handleView = (cn) => setSelectedCreditNote(cn);
  const handleEdit = (cn) => navigate(`/credit-notes/${cn.id}/edit`);
  const handleDeleteDraft = (cn) => setDeleteConfirm({ isOpen: true, creditNote: cn });
  const handleRequestEdit = (cn) => setRequestDialog({ isOpen: true, type: 'edit', creditNote: cn });
  const handleRequestDelete = (cn) => setRequestDialog({ isOpen: true, type: 'delete', creditNote: cn });

  const confirmDeleteDraft = async () => {
    if (!deleteConfirm.creditNote) return;
    try {
      dispatch(deleteCreditNoteStart());
      await creditNoteService.delete(deleteConfirm.creditNote.id);
      dispatch(deleteCreditNoteSuccess(deleteConfirm.creditNote.id));
      setDeleteConfirm({ isOpen: false, creditNote: null });
    } catch (err) {
      dispatch(deleteCreditNoteFailure(err.message));
    }
  };

  const confirmRequest = async (reason) => {
    const cn = requestDialog.creditNote;
    if (!cn) return;

    try {
      if (requestDialog.type === 'edit') {
        dispatch(requestEditStart());
        const data = await creditNoteService.requestEdit(cn.id, reason);
        dispatch(requestEditSuccess(data));
      } else {
        dispatch(requestDeleteStart());
        const data = await creditNoteService.requestDelete(cn.id, reason);
        dispatch(requestDeleteSuccess(data));
      }
      setRequestDialog({ isOpen: false, type: null, creditNote: null });
    } catch (err) {
      if (requestDialog.type === 'edit') {
        dispatch(requestEditFailure(err.message));
      } else {
        dispatch(requestDeleteFailure(err.message));
      }
    }
  };

  if (!isAuthenticated) return null;

  // Calculate summary stats
  const stats = {
    total: creditNotes.length,
    draft: creditNotes.filter((cn) => cn.status === 'DRAFT').length,
    pending: creditNotes.filter((cn) => cn.status === 'PENDING_APPROVAL').length,
    approved: creditNotes.filter((cn) => ['APPROVED', 'READY_TO_PROCESS'].includes(cn.status)).length,
    totalRemaining: creditNotes.reduce((sum, cn) => sum + (cn.remainingAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Credit Notes</h1>
                <p className="text-sm text-gray-600 mt-1">View and manage your credit notes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Table
                </button>
              </div>
              <button
                onClick={() => navigate('/credit-notes/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                + New Credit Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Total CNs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Drafts</p>
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500">Available Credit</p>
            <p className="text-2xl font-bold text-blue-600">₹{stats.totalRemaining.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())} className="text-red-500 hover:text-red-700">
              Dismiss
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading credit notes...</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditNotes.map((cn) => (
              <CreditNoteCard
                key={cn.id}
                creditNote={cn}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteDraft}
                onRequestEdit={handleRequestEdit}
                onRequestDelete={handleRequestDelete}
              />
            ))}
            {creditNotes.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium">No credit notes yet</p>
                <button
                  onClick={() => navigate('/credit-notes/new')}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create your first credit note
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <CreditNoteList
              creditNotes={creditNotes}
              filters={filters}
              onFilterChange={(f) => dispatch(setCreditNoteFilters(f))}
              onViewCreditNote={handleView}
              pagination={pagination}
              onPageChange={(page) => dispatch(setCreditNotePage(page))}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCreditNote && (
        <CreditNoteDetail
          creditNote={selectedCreditNote}
          onClose={() => setSelectedCreditNote(null)}
          onRequestEdit={handleRequestEdit}
          onRequestDelete={handleRequestDelete}
        />
      )}

      {/* Request Dialog */}
      <ConfirmRequestDialog
        isOpen={requestDialog.isOpen}
        type={requestDialog.type}
        creditNote={requestDialog.creditNote}
        onClose={() => setRequestDialog({ isOpen: false, type: null, creditNote: null })}
        onConfirm={confirmRequest}
        isLoading={isLoading}
      />

      {/* Delete Draft Confirm */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xl">🗑️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Draft</h3>
                <p className="text-sm text-gray-500">{deleteConfirm.creditNote?.creditNoteId}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this draft credit note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, creditNote: null })}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDraft}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
