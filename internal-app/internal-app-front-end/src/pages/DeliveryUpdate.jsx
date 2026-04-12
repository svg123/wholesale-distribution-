import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiTruck, FiSearch, FiFilter, FiMapPin, FiUser, FiClock,
  FiCheckCircle, FiAlertCircle, FiPackage, FiNavigation,
  FiArrowRight, FiLayers, FiGrid, FiList
} from 'react-icons/fi';
import {
  initializeDeliveryData,
  assignDeliveryTask,
  unassignDeliveryTask,
  reassignDeliveryTask,
  updateDeliveryTaskStatus,
  setDeliveryFilters,
} from '../redux/slices/deliverySlice';
import DeliveryTaskCard from '../components/delivery/DeliveryTaskCard';
import DeliveryStatusBadge from '../components/delivery/DeliveryStatusBadge';
import AssignmentModal from '../components/delivery/AssignmentModal';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import {
  mockDeliveryTasks,
  mockDeliveryPersonnel,
  mockAreaMappings,
  autoAssignDeliveryTask,
} from '../services/deliveryService';
import { DELIVERY_STATUSES, DELIVERY_STATUS_CONFIG } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const STATUS_TABS = [
  { key: '', label: 'All Tasks', icon: FiLayers },
  { key: DELIVERY_STATUSES.READY_FOR_DISPATCH, label: 'Unassigned', icon: FiAlertCircle, color: 'yellow' },
  { key: DELIVERY_STATUSES.ASSIGNED, label: 'Assigned', icon: FiUser, color: 'purple' },
  { key: DELIVERY_STATUSES.IN_PROGRESS, label: 'In Progress', icon: FiNavigation, color: 'blue' },
  { key: DELIVERY_STATUSES.DELIVERED, label: 'Delivered', icon: FiCheckCircle, color: 'green' },
];

const DeliveryUpdateDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { deliveryTasks, deliveryPersonnel, areaMappings, stats, filters, isLoading } = useSelector(
    (state) => state.delivery
  );

  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [viewMode, setViewMode] = useState('card'); // card or table
  const [assigningTask, setAssigningTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

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

  // Auto-run assignment for unassigned tasks
  useEffect(() => {
    if (deliveryTasks.length === 0) return;
    
    const unassigned = deliveryTasks.filter(
      (t) => t.status === DELIVERY_STATUSES.READY_FOR_DISPATCH && !t.assignedTo
    );

    unassigned.forEach((task) => {
      const result = autoAssignDeliveryTask(task, areaMappings, deliveryPersonnel);
      if (result) {
        dispatch(assignDeliveryTask({
          taskId: task.id,
          personnelId: result.personnelId,
          personnelName: result.personnelName,
          assignedBy: result.assignedBy,
        }));
      }
    });
  }, [deliveryTasks.length]); // Only run on initial load

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = [...deliveryTasks];

    // Status filter
    if (activeTab) {
      result = result.filter((t) => t.status === activeTab);
    }

    // Area filter
    if (areaFilter) {
      result = result.filter((t) => t.area === areaFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.orderId.toLowerCase().includes(q) ||
          t.pharmacy.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          (t.assignedTo && t.assignedTo.name.toLowerCase().includes(q))
      );
    }

    // Sort: newest first
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [deliveryTasks, activeTab, areaFilter, searchQuery]);

  // Get unique areas
  const uniqueAreas = useMemo(
    () => [...new Set(deliveryTasks.map((t) => t.area))].sort(),
    [deliveryTasks]
  );

  // Handlers
  const handleAssign = (task) => {
    setAssigningTask(task);
  };

  const handleAssignSubmit = ({ taskId, personnelId, personnelName, assignedBy }) => {
    const task = deliveryTasks.find((t) => t.id === taskId);
    if (task && task.assignedTo) {
      // Reassign
      dispatch(reassignDeliveryTask({ taskId, personnelId, personnelName, reassignedBy: assignedBy }));
    } else {
      dispatch(assignDeliveryTask({ taskId, personnelId, personnelName, assignedBy }));
    }
  };

  const handleStatusUpdate = (task, newStatus) => {
    dispatch(updateDeliveryTaskStatus({
      taskId: task.id,
      status: newStatus,
    }));
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  // Check permissions
  const canAssign = ['ADMIN', 'MANAGEMENT', 'OPERATOR'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FiTruck className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Delivery Update</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Central tracking system for all delivery tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/my-delivery-tasks')}
            className="btn btn-outline flex items-center gap-2"
          >
            <FiPackage className="w-4 h-4" />
            My Deliveries
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className="card cursor-pointer hover:ring-2 hover:ring-yellow-300 transition-all"
          onClick={() => setActiveTab(DELIVERY_STATUSES.READY_FOR_DISPATCH)}
        >
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Unassigned</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.unassigned}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="card cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
          onClick={() => setActiveTab(DELIVERY_STATUSES.ASSIGNED)}
        >
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.assigned}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUser className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="card cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
          onClick={() => setActiveTab(DELIVERY_STATUSES.IN_PROGRESS)}
        >
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiNavigation className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="card cursor-pointer hover:ring-2 hover:ring-green-300 transition-all"
          onClick={() => setActiveTab(DELIVERY_STATUSES.DELIVERED)}
        >
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Delivered</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key || 'all'}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
                  {tab.key === ''
                    ? deliveryTasks.length
                    : deliveryTasks.filter((t) => t.status === tab.key).length}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <VoiceSearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(val) => setSearchQuery(val)}
            placeholder="Search by Order ID, Pharmacy, Area, or Delivery Person"
            inputWidth="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="">All Areas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 ${viewMode === 'card' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <FiSearch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No delivery tasks found</h3>
          <p className="text-sm text-gray-400">
            {searchQuery ? 'Try adjusting your search or filters' : 'No tasks in this category'}
          </p>
          {(searchQuery || areaFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setAreaFilter(''); }}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <DeliveryTaskCard
              key={task.id}
              task={task}
              onAssign={canAssign ? handleAssign : undefined}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Pharmacy</th>
                  <th>Area</th>
                  <th>Amount</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Dispatch Time</th>
                  {canAssign && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td>
                      <span className="text-sm font-mono font-semibold text-primary-600">{task.orderId}</span>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.pharmacy}</p>
                        <p className="text-xs text-gray-500">{task.items} items</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{task.area}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(task.totalAmount)}</span>
                    </td>
                    <td>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                            <FiUser className="w-3 h-3 text-primary-600" />
                          </div>
                          <span className="text-sm text-gray-700">{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <DeliveryStatusBadge status={task.status} />
                    </td>
                    <td>
                      <span className="text-xs text-gray-500">
                        {task.dispatchedAt
                          ? new Date(task.dispatchedAt).toLocaleString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: 'short',
                            })
                          : '—'}
                      </span>
                    </td>
                    {canAssign && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {task.status === DELIVERY_STATUSES.READY_FOR_DISPATCH && (
                            <button
                              onClick={() => handleAssign(task)}
                              className="btn btn-primary text-xs py-1 px-2"
                            >
                              Assign
                            </button>
                          )}
                          {task.assignedTo && task.status !== DELIVERY_STATUSES.DELIVERED && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(task, getNextStatus(task.status))}
                                className="btn btn-outline text-xs py-1 px-2"
                              >
                                {getNextStatusLabel(task.status)}
                              </button>
                              <button
                                onClick={() => handleAssign(task)}
                                className="btn btn-ghost text-xs py-1 px-2"
                              >
                                Reassign
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assigningTask && (
        <AssignmentModal
          task={assigningTask}
          personnel={deliveryPersonnel}
          areaMappings={areaMappings}
          onClose={() => setAssigningTask(null)}
          onAssign={handleAssignSubmit}
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
                <p className="text-xs text-gray-500">{selectedTask.pharmacyAddress}</p>
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
              {selectedTask.assignedTo && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedTask.assignedTo.name}</p>
                  <p className="text-xs text-gray-500">Assigned by: {selectedTask.assignedBy}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for status progression
function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case DELIVERY_STATUSES.READY_FOR_DISPATCH:
      return DELIVERY_STATUSES.ASSIGNED;
    case DELIVERY_STATUSES.ASSIGNED:
      return DELIVERY_STATUSES.IN_PROGRESS;
    case DELIVERY_STATUSES.IN_PROGRESS:
      return DELIVERY_STATUSES.DELIVERED;
    default:
      return null;
  }
}

function getNextStatusLabel(currentStatus) {
  switch (currentStatus) {
    case DELIVERY_STATUSES.READY_FOR_DISPATCH:
      return 'Assign';
    case DELIVERY_STATUSES.ASSIGNED:
      return 'Start';
    case DELIVERY_STATUSES.IN_PROGRESS:
      return 'Delivered';
    default:
      return '';
  }
}

export default DeliveryUpdateDashboard;
