import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPackage, FiCheck, FiClock, FiCircle, FiArrowLeft } from 'react-icons/fi';
import StatusBadge from '../components/common/StatusBadge';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import { PageLoader } from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

const mockTimeline = {
  orderId: 'ORD-20260408-001',
  pharmacy: 'Delhi Medical Store',
  totalAmount: 24500,
  date: '2026-04-08T10:30:00Z',
  timeline: [
    { status: 'PLACED', timestamp: '2026-04-08T10:30:00Z', location: 'Central', completed: true },
    { status: 'PROCESSING', timestamp: '2026-04-08T10:45:00Z', location: 'Central', completed: true },
    { status: 'AT_SUBSTATION', timestamp: '2026-04-08T11:30:00Z', location: 'Mankind Sub-Station', completed: true, substation: 'Mankind Pharma' },
    { status: 'AT_SUBSTATION', timestamp: '2026-04-08T13:15:00Z', location: 'Abbott Sub-Station', completed: false, substation: 'Abbott India', inProgress: true },
    { status: 'AT_SUBSTATION', timestamp: null, location: 'Cipla Sub-Station', completed: false, substation: 'Cipla Ltd' },
    { status: 'DISPATCHED', timestamp: null, location: 'Dispatch', completed: false },
  ],
  itemsAtCurrentStation: [
    { productName: 'Telmikind 20', orderedQty: 50, filledQty: 30 },
    { productName: 'Crocin 650', orderedQty: 20, filledQty: 0 },
  ],
};

function TimelineStep({ step, isLast }) {
  const isCompleted = step.completed;
  const isInProgress = step.inProgress;

  return (
    <div className="flex gap-4">
      {/* Icon Column */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCompleted
              ? 'bg-green-100 text-green-600'
              : isInProgress
              ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {isCompleted ? (
            <FiCheck className="w-4 h-4" />
          ) : isInProgress ? (
            <FiClock className="w-4 h-4" />
          ) : (
            <FiCircle className="w-4 h-4" />
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`} />
        )}
      </div>

      {/* Content */}
      <div className="pb-6">
        <p className={`text-sm font-medium ${isCompleted || isInProgress ? 'text-gray-900' : 'text-gray-400'}`}>
          {step.location}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isCompleted ? formatDate(step.timestamp, 'dd MMM, HH:mm') : isInProgress ? 'In progress...' : 'Pending'}
        </p>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Auto-search when orderId comes from route params
  useEffect(() => {
    if (orderId) {
      setSearchId(orderId);
      performSearch(orderId);
    }
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const performSearch = (id) => {
    if (!id?.trim()) return;

    setSearching(true);
    setError(null);
    // TODO: Replace with actual API call
    setTimeout(() => {
      // Simulate: use the orderId to customize mock data
      setTrackingData({
        ...mockTimeline,
        orderId: id,
      });
      setSearching(false);
    }, 800);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(searchId);
  };

  const handleClear = () => {
    setSearchId('');
    setTrackingData(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          {orderId && (
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="page-title">Order Tracking</h1>
            <p className="page-subtitle">Track orders through the dispatch pipeline</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <VoiceSearchInput
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onSearch={(val) => performSearch(val)}
              placeholder="Enter Order ID (e.g., ORD-20260408-001)"
              inputWidth="w-full"
            />
            {trackingData && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary flex-shrink-0"
              >
                Clear
              </button>
            )}
            <button type="submit" disabled={searching} className="btn-primary flex-shrink-0">
              {searching ? 'Searching...' : 'Track Order'}
            </button>
          </form>
          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Loading */}
      {searching && <PageLoader />}

      {/* Tracking Result */}
      {trackingData && !searching && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Order: {trackingData.orderId}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {trackingData.pharmacy} • {formatCurrency(trackingData.totalAmount)}
                  </p>
                </div>
                <StatusBadge status={trackingData.timeline.find((s) => s.inProgress)?.status || 'PLACED'} />
              </div>
            </div>
            <div className="card-body">
              <div className="mt-2">
                {trackingData.timeline.map((step, index) => (
                  <TimelineStep
                    key={index}
                    step={step}
                    isLast={index === trackingData.timeline.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Current Sub-Station Items */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">Items at Current Station</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {trackingData.itemsAtCurrentStation.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Ordered: {item.orderedQty}</span>
                      <span className="text-xs text-gray-500">Filled: {item.filledQty}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-primary-600 rounded-full h-1.5"
                        style={{ width: `${(item.filledQty / item.orderedQty) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No results + no search yet */}
      {!trackingData && !searching && (
        <div className="card p-12 text-center">
          <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Enter an Order ID above to track its progress</p>
        </div>
      )}
    </div>
  );
}
