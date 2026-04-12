import React, { useState, useMemo } from 'react';

/**
 * OrderSelector Component
 * 
 * Allows users to select an order to track
 * - Dropdown with search
 * - Display order ID, date, and status
 * - Quick filter for active orders
 * - Mobile responsive
 */
const OrderSelector = ({ orders, selectedOrderId, onSelectOrder, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Filter orders based on search and active status
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (showActiveOnly) {
      result = result.filter(
        order => ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(order.status)
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        order =>
          order.id.toLowerCase().includes(term) ||
          order.date.toLowerCase().includes(term)
      );
    }

    return result;
  }, [orders, searchTerm, showActiveOnly]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      CONFIRMED: '✓',
      SHIPPED: '🚚',
      DELIVERED: '✓✓',
      CANCELLED: '✗',
    };
    return icons[status] || '•';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Select Order to Track
        </label>
        
        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left font-medium text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition flex items-center justify-between disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              {selectedOrder ? (
                <>
                  <span className="font-semibold text-blue-600">{selectedOrder.id}</span>
                  <span className="text-sm text-gray-500">({selectedOrder.date})</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Choose an order...</span>
              )}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
              {/* Search Input */}
              <div className="p-4 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search by Order ID or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  autoFocus
                />
              </div>

              {/* Filter Toggle */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeOnly"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="activeOnly" className="text-sm text-gray-700 cursor-pointer">
                  Show active orders only
                </label>
              </div>

              {/* Orders List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        onSelectOrder(order.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition flex items-center justify-between group ${
                        selectedOrderId === order.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {order.id}
                          {selectedOrderId === order.id && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.date} • {order.items} items • ₹{order.total}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No orders found matching your search
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Count */}
      {orders.length > 0 && (
        <p className="text-sm text-gray-500">
          Total orders: <span className="font-semibold text-gray-900">{orders.length}</span>
          {showActiveOnly && (
            <span> • Active: {filteredOrders.length}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default OrderSelector;
