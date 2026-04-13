import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCreditNotesStart,
  fetchCreditNotesSuccess,
  fetchCreditNotesFailure,
  fetchCreditNoteDetailStart,
  fetchCreditNoteDetailSuccess,
  fetchCreditNoteDetailFailure,
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  approveCreditNoteStart,
  approveCreditNoteSuccess,
  approveCreditNoteFailure,
  rejectCreditNoteStart,
  rejectCreditNoteSuccess,
  rejectCreditNoteFailure,
  markReadyToProcessStart,
  markReadyToProcessSuccess,
  markReadyToProcessFailure,
  handleEditRequestStart,
  handleEditRequestSuccess,
  handleEditRequestFailure,
  handleDeleteRequestStart,
  handleDeleteRequestSuccess,
  handleDeleteRequestFailure,
  setCreditNoteFilters,
  setCreditNotePage,
  setSelectedCreditNote,
  clearSelectedCreditNote,
  clearError,
} from '../redux/slices/creditNoteSlice';
import creditNoteService from '../services/creditNoteService';
import CreditNoteDashboard from '../components/credit-note/CreditNoteDashboard';
import CreditNoteTable from '../components/credit-note/CreditNoteTable';
import CreditNoteDetailModal from '../components/credit-note/CreditNoteDetailModal';
import { PageLoader } from '../components/common/LoadingSpinner';
import useCreditNoteNotifications from '../hooks/useCreditNoteNotifications';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';

/**
 * Credit Note Management Page — Internal App.
 * Combines dashboard overview, filterable table, and detail modal with approval actions.
 * Accessible to OPERATOR, STAFF, MANAGEMENT, and ADMIN roles.
 */
export default function CreditNoteManagement() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    creditNotes,
    selectedCreditNote,
    isLoading,
    error,
    stats,
    filters,
    pagination,
  } = useSelector((state) => state.creditNote);

  const userRole = user?.role || 'STAFF';
  const notify = useCreditNoteNotifications();

  // ===== Fetch Credit Notes List =====
  const fetchCreditNotes = useCallback(async () => {
    dispatch(fetchCreditNotesStart());
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        status: filters.status === 'all' ? undefined : filters.status,
        returnType: filters.returnType === 'all' ? undefined : filters.returnType,
      };
      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      const response = await creditNoteService.getAll(params);
      dispatch(fetchCreditNotesSuccess(response));
    } catch (err) {
      dispatch(fetchCreditNotesFailure(err?.response?.data?.message || 'Failed to fetch credit notes'));
    }
  }, [dispatch, pagination.page, pagination.limit, filters]);

  // ===== Fetch Stats =====
  const fetchStats = useCallback(async () => {
    dispatch(fetchStatsStart());
    try {
      const response = await creditNoteService.getStats();
      dispatch(fetchStatsSuccess(response));
    } catch (err) {
      dispatch(fetchStatsFailure(err?.response?.data?.message || 'Failed to fetch stats'));
    }
  }, [dispatch]);

  // ===== Initial Load =====
  useEffect(() => {
    fetchCreditNotes();
    fetchStats();
  }, [fetchCreditNotes, fetchStats]);

  // ===== View Credit Note Detail =====
  const handleViewDetail = async (creditNoteId) => {
    dispatch(fetchCreditNoteDetailStart());
    try {
      const response = await creditNoteService.getById(creditNoteId);
      dispatch(fetchCreditNoteDetailSuccess(response));
    } catch (err) {
      dispatch(fetchCreditNoteDetailFailure(err?.response?.data?.message || 'Failed to fetch detail'));
    }
  };

  // ===== Approve Credit Note =====
  const handleApprove = async (creditNoteId, data) => {
    dispatch(approveCreditNoteStart());
    try {
      const response = await creditNoteService.approve(creditNoteId, data);
      dispatch(approveCreditNoteSuccess(response));
      dispatch(clearSelectedCreditNote());
      notify.notifyApproved(creditNoteId);
      fetchCreditNotes();
      fetchStats();
    } catch (err) {
      dispatch(approveCreditNoteFailure(err?.response?.data?.message || 'Approval failed'));
    }
  };

  // ===== Reject Credit Note =====
  const handleReject = async (creditNoteId, data) => {
    dispatch(rejectCreditNoteStart());
    try {
      const response = await creditNoteService.reject(creditNoteId, data);
      dispatch(rejectCreditNoteSuccess(response));
      dispatch(clearSelectedCreditNote());
      notify.notifyRejected(creditNoteId);
      fetchCreditNotes();
      fetchStats();
    } catch (err) {
      dispatch(rejectCreditNoteFailure(err?.response?.data?.message || 'Rejection failed'));
    }
  };

  // ===== Mark Ready-to-Process =====
  const handleMarkReady = async (creditNoteId, data) => {
    dispatch(markReadyToProcessStart());
    try {
      const response = await creditNoteService.markReadyToProcess(creditNoteId, data);
      dispatch(markReadyToProcessSuccess(response));
      dispatch(clearSelectedCreditNote());
      notify.notifyReadyToProcess(creditNoteId);
      fetchCreditNotes();
      fetchStats();
    } catch (err) {
      dispatch(markReadyToProcessFailure(err?.response?.data?.message || 'Failed to mark ready'));
    }
  };

  // ===== Handle Edit Request =====
  const handleEditRequest = async (creditNoteId, data) => {
    dispatch(handleEditRequestStart());
    try {
      const response = await creditNoteService.handleEditRequest(creditNoteId, data);
      dispatch(handleEditRequestSuccess(response));
      dispatch(clearSelectedCreditNote());
      notify.notifyEditApproved(creditNoteId);
      fetchCreditNotes();
      fetchStats();
    } catch (err) {
      dispatch(handleEditRequestFailure(err?.response?.data?.message || 'Failed to handle edit request'));
    }
  };

  // ===== Handle Delete Request =====
  const handleDeleteRequest = async (creditNoteId, data) => {
    dispatch(handleDeleteRequestStart());
    try {
      const response = await creditNoteService.handleDeleteRequest(creditNoteId, data);
      dispatch(handleDeleteRequestSuccess(response));
      dispatch(clearSelectedCreditNote());
      notify.notifyDeleteApproved(creditNoteId);
      fetchCreditNotes();
      fetchStats();
    } catch (err) {
      dispatch(handleDeleteRequestFailure(err?.response?.data?.message || 'Failed to handle delete request'));
    }
  };

  // ===== Filter by Status from Dashboard =====
  const handleViewByStatus = (status) => {
    dispatch(setCreditNoteFilters({ status }));
  };

  // ===== Filter Changes =====
  const handleFilterChange = (newFilters) => {
    dispatch(setCreditNoteFilters(newFilters));
  };

  // ===== Page Change =====
  const handlePageChange = (page) => {
    dispatch(setCreditNotePage(page));
  };

  // ===== Close Detail Modal =====
  const handleCloseDetail = () => {
    dispatch(clearSelectedCreditNote());
  };

  // ===== Export CSV =====
  const handleExportCSV = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === 'all') {
          delete params[key];
        }
      });
      const response = await creditNoteService.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `credit-notes-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      dispatch(clearError());
    }
  };

  // ===== Clear Error =====
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Note Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, approve, and manage credit note requests from pharmacies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCreditNotes}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => dispatch(clearError())} className="text-red-500 hover:text-red-700 text-lg">&times;</button>
        </div>
      )}

      {/* Dashboard Stats */}
      <CreditNoteDashboard stats={stats} onViewByStatus={handleViewByStatus} />

      {/* Credit Notes Table */}
      <CreditNoteTable
        creditNotes={creditNotes}
        filters={filters}
        onFilterChange={handleFilterChange}
        onViewDetail={handleViewDetail}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      {/* Detail Modal */}
      {selectedCreditNote && (
        <CreditNoteDetailModal
          creditNote={selectedCreditNote}
          onClose={handleCloseDetail}
          onApprove={handleApprove}
          onReject={handleReject}
          onMarkReady={handleMarkReady}
          onHandleEdit={handleEditRequest}
          onHandleDelete={handleDeleteRequest}
          userRole={userRole}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && creditNotes.length === 0 && <PageLoader />}
    </div>
  );
}
