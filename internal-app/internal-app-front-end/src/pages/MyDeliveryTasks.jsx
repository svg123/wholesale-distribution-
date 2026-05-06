import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiPackage, FiCheck, FiNavigation, FiClock, FiTruck,
  FiSearch, FiFilter, FiMapPin, FiPhone, FiMoreVertical,
  FiArrowRight, FiUser, FiCalendar, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import {
  initializeDeliveryData,
  updateDeliveryTaskStatus,
} from '../redux/slices/deliverySlice';
import DeliveryStatusBadge from '../components/delivery/DeliveryStatusBadge';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import OTPVerificationModal from '../components/delivery/OTPVerificationModal';
import {
  mockDeliveryTasks,
  mockDeliveryPersonnel,
  mockAreaMappings,
  generateTaskOTP,
  verifyTaskOTP,
  regenerateTaskOTP,
  getOTPTaskStatus,
  OTP_CONFIG,
} from '../services/deliveryService';
import { DELIVERY_STATUSES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const MyDeliveryTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { deliveryTasks, deliveryPersonnel, areaMappings, isLoading } = useSelector(
    (state) => state.delivery
  );

  const [activeTab, setActiveTab] = useState(DELIVERY_STATUSES.ASSIGNED);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [otpTask, setOtpTask] = useState(null);
  const [otpRefreshKey, setOtpRefreshKey] = useState(0);

  // Initialize mock data
  useEffect(() => {
    if (deliveryTasks.length === 0) {
      dispatch(
        initializeDeliveryData({
          tasks: mockDeliveryTasks,
          personnel: mockDeliveryPersonnel,
          areaMappings: mockAreaMappings,
        })
      );
    }
  }, [dispatch, deliveryTasks.length]);

  // Filter tasks for current user
  const myTasks = useMemo(() => {
    // Find the delivery person ID for the current user
    const deliveryPerson = deliveryPersonnel.find((p) => p.staffId === user?.id || p.id === user?.id);
    if (!deliveryPerson) return [];

    return deliveryTasks.filter((t) => t.assignedTo?.id === deliveryPerson.id);
  }, [deliveryTasks, deliveryPersonnel, user]);

  // Filter by tab and search
  const filteredTasks = useMemo(() => {
    let result = [...myTasks];

    // Tab filter
    if (activeTab) {
      result = result.filter((t) => t.status === activeTab);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.orderId.toLowerCase().includes(q) ||
          t.pharmacy.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q)
      );
    }

    // Sort: assigned tasks first (newest), then by status
    result.sort((a, b) => {
      // Put ASSIGNED first
      if (a.status === DELIVERY_STATUSES.ASSIGNED && b.status !== DELIVERY_STATUSES.ASSIGNED) return -1;
      if (a.status !== DELIVERY_STATUSES.ASSIGNED && b.status === DELIVERY_STATUSES.ASSIGNED) return 1;
      // Then by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [myTasks, activeTab, searchQuery]);

  // Get stats
  const stats = useMemo(() => ({
    assigned: myTasks.filter((t) => t.status === DELIVERY_STATUSES.ASSIGNED).length,
    inProgress: myTasks.filter((t) => t.status === DELIVERY_STATUSES.IN_PROGRESS).length,
    delivered: myTasks.filter((t) => t.status === DELIVERY_STATUSES.DELIVERED).length,
    total: myTasks.length,
  }), [myTasks]);

  // Handlers
  const handleStatusUpdate = (task, newStatus) => {
    dispatch(updateDeliveryTaskStatus({
      taskId: task.id,
      status: newStatus,
    }));
    // Auto-generate OTP when starting delivery (moving to IN_PROGRESS)
    if (newStatus === DELIVERY_STATUSES.IN_PROGRESS) {
      try {
        generateTaskOTP(task.id);
      } catch (e) {
        console.warn('OTP generation warning:', e.message);
      }
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  // OTP verification handlers
  const handleVerifyOTP = (task) => {
    setOtpTask(task);
  };

  const handleOTPVerified = async (taskId, otpValue) => {
    const result = verifyTaskOTP(taskId, otpValue);
    if (result.success) {
      dispatch(updateDeliveryTaskStatus({
        taskId: taskId,
        status: DELIVERY_STATUSES.DELIVERED,
      }));
    }
  };

  const handleOTPModalClose = () => {
    setOtpTask(null);
  };

  // Handle OTP regeneration for delivery agent
  const handleRegenerateOTP = (taskId) => {
    try {
      const result = regenerateTaskOTP(taskId);
      return result;
    } catch (err) {
      throw err;
    }
  };

  // Tabs
  const TABS = [
    { key: DELIVERY_STATUSES.ASSIGNED, label: 'Assigned', count: stats.assigned, icon: FiAlertCircle, color: 'purple' },
    { key: DELIVERY_STATUSES.IN_PROGRESS, label: 'In Progress', count: stats.inProgress, icon: FiNavigation, color: 'blue' },
    { key: DELIVERY_STATUSES.DELIVERED, label: 'Delivered', count: stats.delivered, icon: FiCheckCircle, color: 'green' },
  ];

  const deliveryPerson = deliveryPersonnel.find((p) => p.staffId === user?.id || p.id === user?.id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FiPackage className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {deliveryPerson ? `Welcome, ${deliveryPerson.name}` : 'View and manage your assigned deliveries'}
          </p>
        </div>
        <button
          onClick={() => navigate('/delivery-update')}
          className="btn btn-outline flex items-center gap-2"
        >
          <FiTruck className="w-4 h-4" />
          All Deliveries
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className={`card cursor-pointer transition-all ${
            activeTab === DELIVERY_STATUSES.ASSIGNED ? 'ring-2 ring-purple-300' : 'hover:ring-2 hover:ring-purple-200'
          }`}
          onClick={() => setActiveTab(DELIVERY_STATUSES.ASSIGNED)}
        >
          <div className="card-body p-4 text-center">
            <FiAlertCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{stats.assigned}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Assigned</p>
          </div>
        </div>
        <div
          className={`card cursor-pointer transition-all ${
            activeTab === DELIVERY_STATUSES.IN_PROGRESS ? 'ring-2 ring-blue-300' : 'hover:ring-2 hover:ring-blue-200'
          }`}
          onClick={() => setActiveTab(DELIVERY_STATUSES.IN_PROGRESS)}
        >
          <div className="card-body p-4 text-center">
            <FiNavigation className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">In Progress</p>
          </div>
        </div>
        <div
          className={`card cursor-pointer transition-all ${
            activeTab === DELIVERY_STATUSES.DELIVERED ? 'ring-2 ring-green-300' : 'hover:ring-2 hover:ring-green-200'
          }`}
          onClick={() => setActiveTab(DELIVERY_STATUSES.DELIVERED)}
        >
          <div className="card-body p-4 text-center">
            <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Delivered</p>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      {deliveryPerson && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <FiTruck className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Today's Progress</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-600">
                <span className="font-semibold text-gray-900">{deliveryPerson.todayDeliveries}</span> deliveries today
              </span>
              <span className="text-xs text-gray-600">
                <span className="font-semibold text-gray-900">{deliveryPerson.totalDeliveries}</span> total
              </span>
              <span className="text-xs text-gray-600">
                <span className="font-semibold text-yellow-600">★</span> {deliveryPerson.rating} rating
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Vehicle</p>
            <p className="text-sm font-medium text-gray-900">{deliveryPerson.vehicle || 'Not assigned'}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <div>
        <VoiceSearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={(val) => setSearchQuery(val)}
          placeholder="Search by Order ID, Pharmacy, or Area"
          inputWidth="w-full"
        />
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No delivery tasks found</h3>
          <p className="text-sm text-gray-400">
            {activeTab
              ? `You have no ${activeTab === DELIVERY_STATUSES.ASSIGNED ? 'assigned' : activeTab === DELIVERY_STATUSES.IN_PROGRESS ? 'in-progress' : 'delivered'} deliveries`
              : 'No delivery tasks assigned to you'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const priorityConfig = {
              HIGH: { label: 'High', class: 'bg-red-100 text-red-700 border-red-200' },
              MEDIUM: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
              LOW: { label: 'Low', class: 'bg-gray-100 text-gray-600 border-gray-200' },
            };
            const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

            // Get OTP status for this task
            const otpStatus = task.status === DELIVERY_STATUSES.IN_PROGRESS
              ? getOTPTaskStatus(task.id)
              : null;

            return (
              <div key={task.id} className="card hover:shadow-md transition-all">
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      task.status === DELIVERY_STATUSES.ASSIGNED ? 'bg-purple-100' :
                      task.status === DELIVERY_STATUSES.IN_PROGRESS ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {task.status === DELIVERY_STATUSES.ASSIGNED && <FiAlertCircle className="w-6 h-6 text-purple-600" />}
                      {task.status === DELIVERY_STATUSES.IN_PROGRESS && <FiNavigation className="w-6 h-6 text-blue-600" />}
                      {task.status === DELIVERY_STATUSES.DELIVERED && <FiCheckCircle className="w-6 h-6 text-green-600" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-mono font-semibold text-primary-600">{task.orderId}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${priority.class}`}>
                              {priority.label}
                            </span>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900">{task.pharmacy}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <FiMapPin className="w-3 h-3" />
                            <span>{task.pharmacyAddress}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(task.totalAmount)}</p>
                          <p className="text-xs text-gray-500">{task.items} items</p>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          <span>Assigned {task.assignedAt ? new Date(task.assignedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—'}</span>
                        </div>
                        {task.priority === 'HIGH' && task.status === DELIVERY_STATUSES.ASSIGNED && (
                          <span className="text-amber-600 font-medium">⚡ Priority Delivery</span>
                        )}
                      </div>

                      {/* Notes */}
                      {task.notes && (
                        <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                          📝 {task.notes}
                        </div>
                      )}

                      {/* OTP Status Indicator for IN_PROGRESS tasks */}
                      {task.status === DELIVERY_STATUSES.IN_PROGRESS && otpStatus && (
                        <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs font-medium ${
                          otpStatus.isActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : otpStatus.isUsed
                            ? 'bg-gray-50 text-gray-500 border border-gray-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {otpStatus.isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              OTP Active - Ask customer for OTP to verify delivery
                            </>
                          ) : otpStatus.isUsed ? (
                            <>✅ OTP Used - Delivery completed</>
                          ) : (
                            <>⏰ OTP Expired - Regenerate to continue delivery</>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        {task.status === DELIVERY_STATUSES.ASSIGNED && (
                          <button
                            onClick={() => handleStatusUpdate(task, DELIVERY_STATUSES.IN_PROGRESS)}
                            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          >
                            <FiNavigation className="w-3.5 h-3.5" />
                            Start Delivery
                          </button>
                        )}
                        {task.status === DELIVERY_STATUSES.IN_PROGRESS && (
                          <button
                            onClick={() => handleVerifyOTP(task)}
                            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          >
                            🔐 Verify OTP & Deliver
                          </button>
                        )}
                        {task.status === DELIVERY_STATUSES.IN_PROGRESS && otpStatus && !otpStatus.isActive && !otpStatus.isUsed && (
                          <button
                            onClick={async () => {
                              try {
                                await handleRegenerateOTP(task.id);
                                setOtpRefreshKey(prev => prev + 1);
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                            className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                          >
                            🔄 Regenerate OTP
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(task)}
                          className="btn btn-ghost text-xs py-1.5 px-3 ml-auto"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpTask && (
        <OTPVerificationModal
          delivery={otpTask}
          onVerify={handleOTPVerified}
          onClose={handleOTPModalClose}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-semibold text-primary-600">{selectedTask.orderId}</span>
                <DeliveryStatusBadge status={selectedTask.status} size="lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedTask.pharmacy}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <FiMapPin className="w-3 h-3" />
                  <span>{selectedTask.pharmacyAddress}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Area</p>
                  <p className="font-medium text-gray-900">{selectedTask.area}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-medium text-gray-900">{formatCurrency(selectedTask.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Items</p>
                  <p className="font-medium text-gray-900">{selectedTask.items}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <p className="font-medium text-gray-900">{selectedTask.priority}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div>
                  <p>Created</p>
                  <p className="font-medium text-gray-700">{new Date(selectedTask.createdAt).toLocaleString('en-IN')}</p>
                </div>
                {selectedTask.assignedAt && (
                  <div>
                    <p>Assigned</p>
                    <p className="font-medium text-gray-700">{new Date(selectedTask.assignedAt).toLocaleString('en-IN')}</p>
                  </div>
                )}
                {selectedTask.dispatchedAt && (
                  <div>
                    <p>Dispatched</p>
                    <p className="font-medium text-gray-700">{new Date(selectedTask.dispatchedAt).toLocaleString('en-IN')}</p>
                  </div>
                )}
                {selectedTask.deliveredAt && (
                  <div>
                    <p>Delivered</p>
                    <p className="font-medium text-gray-700">{new Date(selectedTask.deliveredAt).toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
              {selectedTask.notes && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                  📝 {selectedTask.notes}
                </div>
              )}
              {/* OTP Status in Detail Modal */}
              {selectedTask.status === DELIVERY_STATUSES.IN_PROGRESS && (() => {
                const otpStatus = getOTPTaskStatus(selectedTask.id);
                if (!otpStatus) return null;
                return (
                  <div className={`p-3 rounded-lg border ${
                    otpStatus.isActive
                      ? 'bg-green-50 border-green-200'
                      : otpStatus.isUsed
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        🔐 OTP Status
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        otpStatus.isActive
                          ? 'bg-green-200 text-green-800'
                          : otpStatus.isUsed
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {otpStatus.isActive ? 'Active' : otpStatus.isUsed ? 'Used' : 'Expired'}
                      </span>
                    </div>
                    {otpStatus.isActive && (
                      <p className="text-xs text-gray-600">
                        OTP generated at {new Date(otpStatus.generatedAt).toLocaleTimeString('en-IN')}
                        {' · '}Regenerations: {otpStatus.regenerationCount}/{otpStatus.maxRegenerations}
                      </p>
                    )}
                    {otpStatus.isUsed && (
                      <p className="text-xs text-gray-600">
                        OTP verified and delivery confirmed at {new Date(otpStatus.usedAt).toLocaleTimeString('en-IN')}
                      </p>
                    )}
                    {!otpStatus.isActive && !otpStatus.isUsed && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 mb-2">OTP has expired. Generate a new one.</p>
                        {otpStatus.regenerationCount < otpStatus.maxRegenerations ? (
                          <button
                            onClick={async () => {
                              try {
                                await regenerateTaskOTP(selectedTask.id);
                                setOtpRefreshKey(prev => prev + 1);
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                            className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition"
                          >
                            🔄 Regenerate OTP
                          </button>
                        ) : (
                          <p className="text-xs text-gray-500">Max regeneration limit reached.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDeliveryTasks;
