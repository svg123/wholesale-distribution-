import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiFilter,
  FiSearch,
  FiArrowRight,
  FiRefreshCw,
  FiDollarSign,
  FiPackage,
  FiUser,
} from 'react-icons/fi';
import { PageLoader } from '../components/common/LoadingSpinner';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import StatCard from '../components/common/StatCard';
import billService from '../services/billService';

// ── Helpers ──────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ── Bill Status Config ───────────────────────────────────────────
const BILL_STATUS = {
  PENDING: { label: 'Pending Bill', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
  BILLED:  { label: 'Billed',       color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
};

// ── Filter Options ───────────────────────────────────────────────
const FILTERS = {
  ALL: 'ALL',
  PENDING: 'PENDING',
  BILLED: 'BILLED',
};

export default function BillDashboard() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Load Data ──────────────────────────────────────────────────
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        billService.getOrdersReadyForBill(),
        billService.getBillStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load bill data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Computed ───────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === FILTERS.ALL || order.billStatus === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.substation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingOrders = orders.filter((o) => o.billStatus === 'PENDING');
  const billedOrders = orders.filter((o) => o.billStatus === 'BILLED');

  // ── Handlers ───────────────────────────────────────────────────
  const handleGenerateBill = (order) => {
    // Navigate to the FinalBill page — pass minimal info,
    // the FinalBill page will call generateBill with the full data
    navigate(`/final-bill/${order.orderNumber}`, {
      state: {
        orderId: order.orderNumber,
        customer: order.customer,
        substation: order.substation,
        substationId: order.substationId,
        // Note: products come from the sub-station processing context.
        // If navigating from here (without sub-station context), the bill page
        // will show a summary based on available data.
        products: [],
        totalProducts: order.totalProducts,
        totalUnits: order.totalUnits,
        estimatedAmount: order.estimatedAmount,
        fromBillDashboard: true,
      },
    });
  };

  // ── Guard ──────────────────────────────────────────────────────
  if (isLoading) return <PageLoader />;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FiFileText className="w-5 h-5" />
            Bill Generation
          </h1>
          <p className="page-subtitle">
            Track sales orders ready for final bill generation
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Ready for Billing"
            value={stats.totalReady}
            subtitle={`${pendingOrders.length} pending`}
            icon="pending"
            color="yellow"
          />
          <StatCard
            title="Pending Bills"
            value={stats.pendingBill}
            subtitle="Awaiting generation"
            icon="alert"
            color="red"
          />
          <StatCard
            title="Bills Generated"
            value={stats.billed}
            subtitle="Completed invoices"
            icon="completed"
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle={`${stats.todayBilled} billed today`}
            icon="revenue"
            color="purple"
          />
        </div>
      )}

      {/* ── Tracker Bar ─────────────────────────────────────────── */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Bill Generation Progress</p>
            <p className="text-xs text-gray-400">
              {orders.length} processed order(s)
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${orders.length > 0 ? (billedOrders.length / orders.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-gray-600">Billed ({billedOrders.length})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-gray-600">Pending ({pendingOrders.length})</span>
              </span>
            </div>
            <span className="text-gray-500">
              {orders.length > 0
                ? `${Math.round((billedOrders.length / orders.length) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-gray-400" />
          {Object.entries(FILTERS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeFilter === value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {key === 'ALL'
                ? `All (${orders.length})`
                : key === 'PENDING'
                ? `Pending (${pendingOrders.length})`
                : `Billed (${billedOrders.length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <VoiceSearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            inputWidth="w-full"
          />
        </div>
      </div>

      {/* ── Orders Table ────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sub-Station
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Products
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Units
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Est. Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Processed
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FiFileText className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-gray-400">No orders found</p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusCfg = BILL_STATUS[order.billStatus] || BILL_STATUS.PENDING;
                  return (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      {/* Order */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-mono font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-400">{order.customerCode}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiUser className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {order.customer}
                          </span>
                        </div>
                      </td>

                      {/* Sub-Station */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          <FiPackage className="w-3 h-3" />
                          {order.substation}
                        </span>
                      </td>

                      {/* Products */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-700">{order.totalProducts}</span>
                      </td>

                      {/* Units */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-700">{order.totalUnits}</span>
                      </td>

                      {/* Est. Amount */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.estimatedAmount)}
                        </span>
                      </td>

                      {/* Processed */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          {formatTimeAgo(order.processedAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        {order.billStatus === 'PENDING' ? (
                          <button
                            onClick={() => handleGenerateBill(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                          >
                            Generate
                            <FiArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/final-bill/${order.orderNumber}`, {
                                state: {
                                  orderId: order.orderNumber,
                                  customer: order.customer,
                                  fromBillDashboard: true,
                                  viewOnly: true,
                                },
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <FiFileText className="w-3 h-3" />
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary Footer ──────────────────────────────────────── */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-gray-600">
                  <span className="font-bold text-amber-600">{pendingOrders.length}</span> orders pending bill generation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">
                  Est. revenue: <span className="font-bold text-green-600">
                    {formatCurrency(pendingOrders.reduce((s, o) => s + o.estimatedAmount, 0))}
                  </span>
                </span>
              </div>
            </div>
            {pendingOrders.length > 0 && (
              <button
                onClick={() => handleGenerateBill(pendingOrders[0])}
                className="btn-primary flex items-center gap-2"
              >
                <FiFileText className="w-4 h-4" />
                Generate Next Bill
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
