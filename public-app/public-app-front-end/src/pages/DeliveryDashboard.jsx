import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import deliveryService, { DELIVERY_STATUS } from '../services/deliveryService';
import DeliveryStats from '../components/Delivery/DeliveryStats';
import DeliveryCard from '../components/Delivery/DeliveryCard';
import DeliveryStatusTimeline from '../components/Delivery/DeliveryStatusTimeline';
import DeliveryDetailPanel from '../components/Delivery/DeliveryDetailPanel';
import OTPDisplay from '../components/Delivery/OTPDisplay';
import BottomNavBar from '../components/common/BottomNavBar';

/**
 * DeliveryDashboard Page
 * 
 * Main delivery tracking page for pharmacists.
 * 
 * Features:
 * - Stats overview cards
 * - Status filter tabs
 * - Delivery list (card view)
 * - Detail view with timeline and OTP
 * 
 * Navigation flow:
 * Dashboard → Delivery Dashboard → Click delivery → Detail view
 */
const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch deliveries and stats
  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = activeTab ? { status: activeTab } : {};
      const [deliveryData, statsData] = await Promise.all([
        deliveryService.getMyDeliveries(params),
        deliveryService.getDeliveryStats(),
      ]);
      setDeliveries(deliveryData.deliveries);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to load deliveries');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeliveries();
    }
  }, [isAuthenticated, fetchDeliveries]);

  // Filter deliveries by search
  const filteredDeliveries = (() => {
    if (!searchQuery.trim()) return deliveries;
    const q = searchQuery.toLowerCase().trim();
    return deliveries.filter(
      (d) =>
        d.orderId.toLowerCase().includes(q) ||
        d.deliveryAddress.toLowerCase().includes(q) ||
        (d.deliveryPerson && d.deliveryPerson.name.toLowerCase().includes(q))
    );
  })();

  // Handle delivery card click
  const handleDeliveryClick = async (delivery) => {
    try {
      const detail = await deliveryService.getDeliveryById(delivery.id);
      setSelectedDelivery(detail);
    } catch (err) {
      setError(err.message);
    }
  };

  // OTP handlers for OTPDisplay component
  const otpHandlers = {
    getOTP: deliveryService.getOTP,
    regenerateOTP: deliveryService.regenerateOTP,
  };

  // Tab configuration
  const tabs = [
    { key: '', label: 'All', count: stats?.total || 0 },
    { key: DELIVERY_STATUS.ORDER_PLACED, label: 'Placed', count: stats?.orderPlaced || 0 },
    { key: DELIVERY_STATUS.DISPATCHED, label: 'Dispatched', count: stats?.dispatched || 0 },
    { key: DELIVERY_STATUS.OUT_FOR_DELIVERY, label: 'In Transit', count: stats?.outForDelivery || 0 },
    { key: DELIVERY_STATUS.DELIVERED, label: 'Delivered', count: stats?.delivered || 0 },
  ];

  // ===== Detail View =====
  if (selectedDelivery) {
    const showOTP =
      selectedDelivery.status === DELIVERY_STATUS.DISPATCHED ||
      selectedDelivery.status === DELIVERY_STATUS.OUT_FOR_DELIVERY;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container-custom py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                ←
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {selectedDelivery.orderId}
                </h1>
                <p className="text-xs text-gray-500">Delivery Details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom py-6 space-y-6">
          {/* Timeline */}
          <DeliveryStatusTimeline delivery={selectedDelivery} />

          {/* Detail Panel + OTP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DeliveryDetailPanel delivery={selectedDelivery} />
            </div>
            <div className="space-y-6">
              {showOTP && (
                <OTPDisplay delivery={selectedDelivery} onRegenerateOTP={otpHandlers} />
              )}
              {/* Delivered confirmation */}
              {selectedDelivery.status === DELIVERY_STATUS.DELIVERED && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-lg font-semibold text-green-800">Delivery Completed</h3>
                  <p className="text-sm text-green-600 mt-1">
                    This order was successfully delivered and OTP verified.
                  </p>
                  <p className="text-xs text-green-500 mt-2">
                    {selectedDelivery.deliveredTime
                      ? new Date(selectedDelivery.deliveredTime).toLocaleString('en-IN')
                      : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    );
  }

  // ===== List View =====
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🚚 Delivery Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Track your deliveries in real-time</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-sm"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-6 space-y-6">
        {/* Stats */}
        {stats && <DeliveryStats stats={stats} />}

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, address, or delivery agent..."
            className="input-field pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Status Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key || 'all'}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4 animate-spin">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <p className="text-gray-500">Loading deliveries...</p>
            </div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No deliveries found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : activeTab
                ? 'No deliveries in this category'
                : 'Your deliveries will appear here'}
            </p>
            {(searchQuery || activeTab) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          /* Delivery Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onClick={handleDeliveryClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar activeDeliveriesCount={
        stats ? (stats.dispatched + stats.outForDelivery) : 0
      } />
    </div>
  );
};

export default DeliveryDashboard;
