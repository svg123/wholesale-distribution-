import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRequestsStart,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  setRequestFilter,
  updateRequestStatusStart,
  updateRequestStatusSuccess,
  updateRequestStatusFailure,
} from '../redux/slices/requestSlice';
import {
  REQUEST_STATUSES,
  MISMATCH_ISSUE_TYPES,
  MISMATCH_ISSUE_CONFIG,
} from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import { PageLoader } from '../components/common/LoadingSpinner';
import { FiFlag } from 'react-icons/fi';

const mockRequests = [
  {
    id: 'REQ-001',
    orderId: 'ORD-20260408-001',
    substation: 'Mankind Pharma',
    requestedBy: 'Operator-1',
    type: 'SUBTRACT',
    productName: 'Telmikind 20',
    quantity: 5,
    reason: 'Stock mismatch - only 45 available vs 50 ordered',
    status: 'PENDING',
    createdAt: '2026-04-08T14:30:00Z',
  },
  {
    id: 'REQ-002',
    orderId: 'ORD-20260408-002',
    substation: 'Abbott India',
    requestedBy: 'Operator-3',
    type: 'ADD',
    productName: 'Crocin 650',
    quantity: 10,
    reason: 'Customer requested additional quantity via phone',
    status: 'PENDING',
    createdAt: '2026-04-08T13:15:00Z',
  },
  {
    id: 'REQ-003',
    orderId: 'ORD-20260407-045',
    substation: 'Cipla Ltd',
    requestedBy: 'Operator-2',
    type: 'SUBTRACT',
    productName: 'Dolo 650',
    quantity: 3,
    reason: 'Damaged stock found during packing',
    status: 'APPROVED',
    createdAt: '2026-04-07T16:45:00Z',
  },
  {
    id: 'REQ-004',
    orderId: 'ORD-20260407-040',
    substation: 'Mankind Pharma',
    requestedBy: 'Operator-1',
    type: 'MODIFY',
    productName: 'Montair LC',
    quantity: 15,
    reason: 'Wrong batch - need to replace with fresh stock',
    status: 'REJECTED',
    createdAt: '2026-04-07T11:20:00Z',
  },
  {
    id: 'TKT-001',
    orderId: 'ORD-001',
    substation: 'Abbott India',
    requestedBy: 'Operator-1',
    type: 'MISMATCH',
    issueType: 'QUANTITY',
    productName: 'Paracetamol 500mg',
    productId: 'P1',
    quantity: 85,
    requiredQty: 100,
    enteredBatches: [{ batchNumber: 'BN-1001', quantity: 50 }, { batchNumber: 'BN-1002', quantity: 35 }],
    reason: 'QUANTITY mismatch for Paracetamol 500mg',
    status: 'PENDING',
    createdAt: '2026-04-09T10:30:00Z',
  },
  {
    id: 'TKT-002',
    orderId: 'ORD-002',
    substation: 'Cipla Ltd',
    requestedBy: 'Operator-2',
    type: 'MISMATCH',
    issueType: 'STOCK',
    productName: 'Cetirizine 10mg',
    productId: 'P6',
    quantity: 150,
    requiredQty: 200,
    enteredBatches: [{ batchNumber: 'BN-2001', quantity: 150 }],
    reason: 'STOCK mismatch - insufficient stock available at substation',
    status: 'PENDING',
    createdAt: '2026-04-09T09:15:00Z',
  },
];

const filterTabs = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

const typeColors = {
  ADD: 'badge-success',
  SUBTRACT: 'badge-danger',
  MODIFY: 'badge-warning',
  MISMATCH: 'badge-danger',
};

const statusColors = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
};

export default function RequestManagementPage() {
  const dispatch = useDispatch();
  const { requests, isLoading, filter } = useSelector((state) => state.request);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchRequestsStart());
    setTimeout(() => {
      dispatch(fetchRequestsSuccess({ requests: mockRequests, total: mockRequests.length }));
    }, 500);
  }, [dispatch]);

  // Search + filter combined
  const filteredRequests = useMemo(() => {
    let result = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase().trim();
    return result.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.substation.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q)
    );
  }, [requests, filter, searchQuery]);

  const handleApprove = (req) => {
    setConfirmAction({ type: 'approve', request: req });
  };

  const handleReject = (req) => {
    setConfirmAction({ type: 'reject', request: req });
  };

  const confirmApproveReject = async () => {
    if (!confirmAction) return;
    const { type, request } = confirmAction;
    dispatch(updateRequestStatusStart());

    try {
      const newStatus = type === 'approve' ? 'APPROVED' : 'REJECTED';
      dispatch(
        updateRequestStatusSuccess({
          ...request,
          status: newStatus,
          processedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      dispatch(updateRequestStatusFailure(err.message));
    }
    setConfirmAction(null);
  };

  if (isLoading && requests.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Request Management</h1>
        <p className="page-subtitle">Review and manage order modification requests & mismatch tickets</p>
      </div>

      {/* Search */}
      <VoiceSearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by request ID, order ID, product, station, or operator..."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => dispatch(setRequestFilter(tab.key))}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.key !== 'ALL' && (
              <span className="ml-1.5 text-xs">
                ({requests.filter((r) => r.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{req.id}</h4>
                      {req.type === 'MISMATCH' ? (
                        <span className="inline-flex items-center gap-1 badge-danger">
                          <FiFlag className="w-3 h-3" /> Mismatch
                        </span>
                      ) : (
                        <span className={typeColors[req.type] || 'badge-warning'}>{req.type}</span>
                      )}
                      <span className={statusColors[req.status]}>{req.status}</span>
                      {req.issueType && (
                        <span className="text-xs text-gray-500">
                          — {MISMATCH_ISSUE_CONFIG[req.issueType]?.label || req.issueType}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Order</p>
                        <p className="font-medium text-primary-600">{req.orderId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Product</p>
                        <p className="font-medium text-gray-900">{req.productName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Station</p>
                        <p className="font-medium text-gray-900">{req.substation}</p>
                      </div>
                      {req.type === 'MISMATCH' ? (
                        <div>
                          <p className="text-xs text-gray-500">Qty Mismatch</p>
                          <p className="font-medium">
                            <span className="text-red-600">{req.quantity}</span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-gray-900">{req.requiredQty}</span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="font-medium text-gray-900">{req.quantity}</p>
                        </div>
                      )}
                    </div>

                    {/* Mismatch-specific details */}
                    {req.type === 'MISMATCH' && req.enteredBatches && req.enteredBatches.length > 0 && (
                      <div className="mt-3 bg-red-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-700 mb-2">Batch Details:</p>
                        <div className="flex flex-wrap gap-2">
                          {req.enteredBatches.map((batch, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-xs font-mono border border-red-200"
                            >
                              <span className="text-gray-600">{batch.batchNumber}</span>
                              <span className="text-gray-300">:</span>
                              <span className="font-medium text-red-600">{batch.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Reason:</span> {req.reason}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      By {req.requestedBy} • {formatDateTime(req.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(req)}
                        className="btn-success btn-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        className="btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'approve' ? 'Approve Request' : 'Reject Request'}
        message={
          confirmAction
            ? `Are you sure you want to ${confirmAction.type} ${confirmAction.request.type === 'MISMATCH' ? 'mismatch ticket' : 'request'} ${confirmAction.request.id} for ${confirmAction.request.productName}?`
            : ''
        }
        confirmLabel={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
        onConfirm={confirmApproveReject}
        onCancel={() => setConfirmAction(null)}
        danger={confirmAction?.type === 'reject'}
      />
    </div>
  );
}
