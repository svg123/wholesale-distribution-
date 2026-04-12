import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubstationsStart,
  fetchSubstationsSuccess,
  fetchSubstationsFailure,
} from '../redux/slices/substationSlice';
import { FiActivity, FiCheckCircle, FiClock, FiPackage, FiSearch } from 'react-icons/fi';
import { PageLoader } from '../components/common/LoadingSpinner';
import VoiceSearchInput from '../components/common/VoiceSearchInput';

const mockSubstations = [
  {
    id: 'SUB-1',
    name: 'Mankind Pharma',
    status: 'ACTIVE',
    activeOrders: 5,
    totalCompleted: 145,
    avgProcessingTime: '2.5 hrs',
    currentOrders: [
      { orderId: 'ORD-001', status: 'PROCESSING', items: 3 },
      { orderId: 'ORD-002', status: 'PENDING', items: 5 },
      { orderId: 'ORD-003', status: 'READY', items: 2 },
    ],
  },
  {
    id: 'SUB-2',
    name: 'Abbott India',
    status: 'ACTIVE',
    activeOrders: 3,
    totalCompleted: 138,
    avgProcessingTime: '2.0 hrs',
    currentOrders: [
      { orderId: 'ORD-001', status: 'PROCESSING', items: 4 },
      { orderId: 'ORD-003', status: 'PENDING', items: 2 },
    ],
  },
  {
    id: 'SUB-3',
    name: 'Cipla Ltd',
    status: 'ACTIVE',
    activeOrders: 2,
    totalCompleted: 162,
    avgProcessingTime: '1.8 hrs',
    currentOrders: [
      { orderId: 'ORD-002', status: 'PROCESSING', items: 1 },
    ],
  },
  {
    id: 'SUB-4',
    name: 'Sun Pharma',
    status: 'IDLE',
    activeOrders: 0,
    totalCompleted: 95,
    avgProcessingTime: '2.2 hrs',
    currentOrders: [],
  },
];

const statusColors = {
  ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  IDLE: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
  MAINTENANCE: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function SubStationStatusPage() {
  const dispatch = useDispatch();
  const { substations, isLoading } = useSelector((state) => state.substation);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchSubstationsStart());
    // TODO: Replace with actual API call
    setTimeout(() => {
      dispatch(fetchSubstationsSuccess(mockSubstations));
    }, 500);
  }, [dispatch]);

  // Filter substations by search query
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return substations;
    const q = searchQuery.toLowerCase().trim();
    return substations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [substations, searchQuery]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Sub-Station Status</h1>
        <p className="page-subtitle">Monitor real-time status of all sub-stations</p>
      </div>

      {/* Search Bar */}
      <VoiceSearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search sub-stations by name or ID..."
      />

      {/* Summary Bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-700 font-medium">
            {substations.filter((s) => s.status === 'ACTIVE').length} Active
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <span className="text-sm text-gray-600 font-medium">
            {substations.filter((s) => s.status === 'IDLE').length} Idle
          </span>
        </div>
      </div>

      {/* Sub-Station Cards */}
      {filteredStations.length === 0 ? (
        <div className="card p-12 text-center">
          <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? 'No sub-stations match your search' : 'No sub-stations found'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStations.map((station) => {
            const statusColor = statusColors[station.status] || statusColors.IDLE;

            return (
              <div key={station.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{station.name}</h3>
                        <p className="text-xs text-gray-500">{station.id}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
                      {station.status}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg mx-auto mb-1">
                        <FiActivity className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{station.activeOrders}</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg mx-auto mb-1">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{station.totalCompleted}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-50 rounded-lg mx-auto mb-1">
                        <FiClock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{station.avgProcessingTime}</p>
                      <p className="text-xs text-gray-500">Avg Time</p>
                    </div>
                  </div>

                  {/* Current Orders */}
                  {station.currentOrders.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Current Orders</p>
                      <div className="space-y-2">
                        {station.currentOrders.map((order) => (
                          <div key={order.orderId} className="flex items-center justify-between py-1.5">
                            <span className="text-sm font-medium text-primary-600">{order.orderId}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{order.items} items</span>
                              <span className={`badge ${order.status === 'PROCESSING' ? 'badge-warning' : order.status === 'READY' ? 'badge-success' : 'badge-gray'}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}