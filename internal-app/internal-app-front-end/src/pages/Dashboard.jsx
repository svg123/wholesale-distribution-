import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatsStart, fetchStatsSuccess, fetchStatsFailure } from '../redux/slices/dashboardSlice';
import StatCard from '../components/common/StatCard';
import { PageLoader } from '../components/common/LoadingSpinner';
import OrderPipeline from '../components/dashboard/OrderPipeline';
import OrderTimerRow from '../components/dashboard/OrderTimerRow';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import { formatCurrency, formatNumber, getUrgencyLevel } from '../utils/formatters';
import { ROLES } from '../utils/constants';
import { FiFileText, FiArrowRight, FiAlertCircle, FiSearch, FiUser, FiDollarSign, FiCheckSquare, FiCalendar, FiPackage, FiSend } from 'react-icons/fi';

// Helper to create relative timestamps for mock data
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

// Mock data with statusChangedAt timestamps for urgency testing
const mockStats = {
  stats: {
    totalOrders: 1247,
    pendingOrders: 89,
    dispatchingOrders: 156,
    completedOrders: 1002,
    todayOrders: 42,
    todayDispatched: 28,
    todayRevenue: 875000,
  },
  recentOrders: [
    // DELAYED orders (> 4 hours) — sorted to top
    { id: 'ORD-20260408-001', pharmacy: 'MediCare Hub', totalAmount: 31000, status: 'PLACED', date: hoursAgo(5), statusChangedAt: hoursAgo(5), items: 12 },
    { id: 'ORD-20260408-005', pharmacy: 'Apollo Pharmacy', totalAmount: 54000, status: 'PROCESSING', date: hoursAgo(4.5), statusChangedAt: hoursAgo(4.5), items: 20 },
    { id: 'ORD-20260407-052', pharmacy: 'Netra Medicals', totalAmount: 15800, status: 'DISPATCHING', date: hoursAgo(6), statusChangedAt: hoursAgo(6), items: 6 },

    // WARNING orders (3-4 hours)
    { id: 'ORD-20260408-003', pharmacy: 'Delhi Medical Store', totalAmount: 24500, status: 'DISPATCHING', date: hoursAgo(3.5), statusChangedAt: hoursAgo(3.5), items: 8 },
    { id: 'ORD-20260408-008', pharmacy: 'LifeCare Pharma', totalAmount: 19200, status: 'PLACED', date: hoursAgo(3.2), statusChangedAt: hoursAgo(3.2), items: 7 },

    // NORMAL orders (< 2 hours)
    { id: 'ORD-20260408-002', pharmacy: 'Health Plus Pharmacy', totalAmount: 18200, status: 'PROCESSING', date: hoursAgo(1.5), statusChangedAt: hoursAgo(1.5), items: 5 },
    { id: 'ORD-20260408-009', pharmacy: 'City Pharma', totalAmount: 8900, status: 'PLACED', date: hoursAgo(0.5), statusChangedAt: hoursAgo(0.5), items: 3 },
    { id: 'ORD-20260408-010', pharmacy: 'Wellness Drug House', totalAmount: 42300, status: 'DISPATCHING', date: minsAgo(45), statusChangedAt: minsAgo(45), items: 15 },

    // COMPLETED / DISPATCHED — still in pipeline
    { id: 'ORD-20260408-004', pharmacy: 'Sanjeevani Store', totalAmount: 6700, status: 'DISPATCHED', date: hoursAgo(2), statusChangedAt: hoursAgo(1), items: 2 },
    { id: 'ORD-20260408-006', pharmacy: 'Green Cross Pharmacy', totalAmount: 27500, status: 'COMPLETED', date: hoursAgo(3), statusChangedAt: hoursAgo(0.5), items: 9 },
    { id: 'ORD-20260408-007', pharmacy: 'MedPlus Express', totalAmount: 11800, status: 'COMPLETED', date: hoursAgo(4), statusChangedAt: hoursAgo(0.2), items: 4 },
  ],
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, recentOrders, isLoading } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);
  const [pipelineFilter, setPipelineFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isStaff = user?.role === ROLES.STAFF;

  useEffect(() => {
    const loadStats = async () => {
      dispatch(fetchStatsStart());
      try {
        dispatch(fetchStatsSuccess(mockStats));
      } catch (err) {
        dispatch(fetchStatsFailure(err.message));
      }
    };
    loadStats();
  }, [dispatch]);

  if (isLoading) return <PageLoader />;

  // Filter by pipeline stage, then by search query
  const filteredOrders = useMemo(() => {
    let result = pipelineFilter
      ? recentOrders.filter((o) => o.status === pipelineFilter)
      : recentOrders;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.pharmacy.toLowerCase().includes(q)
      );
    }

    return result;
  }, [recentOrders, pipelineFilter, searchQuery]);

  // Sort: oldest first (most urgent at top)
  const sortedOrders = useMemo(() => [...filteredOrders].sort((a, b) => {
    const urgencyOrder = { delayed: 0, warning: 1, normal: 2 };
    const aUrgency = getUrgencyLevel(a.statusChangedAt);
    const bUrgency = getUrgencyLevel(b.statusChangedAt);
    if (urgencyOrder[aUrgency] !== urgencyOrder[bUrgency]) {
      return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
    }
    // Within same urgency, oldest first
    return new Date(a.statusChangedAt) - new Date(b.statusChangedAt);
  }), [filteredOrders]);

  // Count urgency levels
  const delayedCount = recentOrders.filter((o) => getUrgencyLevel(o.statusChangedAt) === 'delayed').length;
  const warningCount = recentOrders.filter((o) => getUrgencyLevel(o.statusChangedAt) === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isStaff ? 'Welcome back, ' + (user?.name || 'Staff') : 'Real-time overview of order operations'}
          </p>
        </div>
        {/* Urgency summary badges — Admin/Manager only */}
        {!isStaff && (
          <div className="flex items-center gap-3">
            {delayedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-700">{delayedCount} Delayed</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm font-semibold text-amber-700">{warningCount} Warning</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== STAFF DASHBOARD ===== */}
      {isStaff && (
        <>
          {/* Staff Quick Actions — 6 Module Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              className="card cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group"
              onClick={() => navigate('/my-portal')}
            >
              <div className="card-body text-center py-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                  <FiUser className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-3">My Portal</h3>
                <p className="text-xs text-gray-500 mt-0.5">Personal info & salary</p>
                <FiArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div
              className="card cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group"
              onClick={() => navigate('/payment-reminder')}
            >
              <div className="card-body text-center py-6">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto group-hover:bg-red-200 transition-colors">
                  <FiDollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-3">Payments</h3>
                <p className="text-xs text-gray-500 mt-0.5">Bills & reminders</p>
                <FiArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div
              className="card cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group"
              onClick={() => navigate('/my-tasks')}
            >
              <div className="card-body text-center py-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto group-hover:bg-amber-200 transition-colors">
                  <FiCheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-3">My Tasks</h3>
                <p className="text-xs text-gray-500 mt-0.5">Assigned by manager</p>
                <FiArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div
              className="card cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group"
              onClick={() => navigate('/leave-application')}
            >
              <div className="card-body text-center py-6">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-3">Leave</h3>
                <p className="text-xs text-gray-500 mt-0.5">Apply & track leave</p>
                <FiArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div
              className="card cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group"
              onClick={() => navigate('/stock-checking')}
            >
              <div className="card-body text-center py-6">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors">
                  <FiPackage className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-3">Stock Check</h3>
                <p className="text-xs text-gray-500 mt-0.5">Daily tally & audit</p>
                <FiArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div
              className="card cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group"
              onClick={() => navigate('/raise-request')}
            >
              <div className="card-body text-center py-6">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mx-auto group-hover:bg-teal-200 transition-colors">
                  <FiSend className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-3">Raise Request</h3>
                <p className="text-xs text-gray-500 mt-0.5">Staff-to-staff tickets</p>
                <FiArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          {/* Staff Today's Quick Summary */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Today's Quick Summary</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Your assigned sub-station activity</p>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                  ● On Duty
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Orders Today</p>
                  <p className="text-xl font-bold text-blue-900">{stats.todayOrders}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                  <p className="text-xl font-bold text-amber-900">{stats.todayOrders - stats.todayDispatched}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Dispatched</p>
                  <p className="text-xl font-bold text-green-900">{stats.todayDispatched}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">Revenue</p>
                  <p className="text-xl font-bold text-purple-900">{formatCurrency(stats.todayRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== ADMIN/MANAGER DASHBOARD ===== */}
      {!isStaff && (
        <>

      {/* Today's Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Orders"
          value={formatNumber(stats.todayOrders)}
          subtitle="Placed today"
          icon="orders"
          color="blue"
        />
        <StatCard
          title="Pending"
          value={formatNumber(stats.todayOrders - stats.todayDispatched)}
          subtitle="Awaiting processing"
          icon="pending"
          color="yellow"
        />
        <StatCard
          title="Dispatched"
          value={formatNumber(stats.todayDispatched)}
          subtitle="Completed today"
          icon="dispatched"
          color="purple"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          subtitle="Collected today"
          icon="revenue"
          color="green"
        />
      </div>

      {/* Bill Generation CTA Banner */}
      <div
        className="card cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group"
        onClick={() => navigate('/bill-dashboard')}
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <FiFileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Bill Generation</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <FiAlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium text-amber-600">4 orders</span>
                  </span>
                  {' '}are ready for final bill generation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary-600 group-hover:text-primary-700">
              <span className="text-sm font-medium">Go to Bills</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Pipeline — Interactive */}
      <OrderPipeline
        orders={recentOrders}
        activeFilter={pipelineFilter}
        onFilterChange={setPipelineFilter}
      />

      {/* Orders with Live Timers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Order List */}
        <div className="lg:col-span-2">
          {/* Search Bar with Voice Search */}
          <div className="mb-3">
            <VoiceSearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={(val) => setSearchQuery(val)}
              placeholder="Search by Order Number or Pharmacy Name"
              inputWidth="w-full"
            />
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              {pipelineFilter ? 'Filtered Orders' : 'Active Orders'}
            </h3>
            <span className="text-sm text-gray-400">{sortedOrders.length} order{sortedOrders.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-2">
            {sortedOrders.length === 0 ? (
              <div className="card p-8 text-center">
                <FiSearch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">
                  {searchQuery ? 'No orders match your search' : 'No orders in this stage'}
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
              sortedOrders.map((order) => (
                <OrderTimerRow key={order.id} order={order} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Today's Summary */}
        <div className="card h-fit">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Today's Summary</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Orders Placed</span>
              <span className="text-lg font-semibold text-gray-900">{stats.todayOrders}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Dispatched</span>
              <span className="text-lg font-semibold text-green-600">{stats.todayDispatched}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="text-lg font-semibold text-yellow-600">
                {stats.todayOrders - stats.todayDispatched}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Revenue</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Dispatch Progress</span>
                <span>{Math.round((stats.todayDispatched / stats.todayOrders) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(stats.todayDispatched / stats.todayOrders) * 100}%` }}
                />
              </div>
            </div>

            {/* Urgency Breakdown */}
            <div className="border-t border-gray-100 pt-3 mt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Urgency Breakdown</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">Delayed (&gt;4h)</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{delayedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-sm text-gray-600">Warning (3-4h)</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">{warningCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <span className="text-sm text-gray-600">Normal (&lt;2h)</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {recentOrders.length - delayedCount - warningCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
