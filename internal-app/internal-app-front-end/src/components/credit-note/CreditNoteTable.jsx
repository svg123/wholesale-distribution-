import React, { useState, useMemo } from 'react';
import { CN_STATUS_CONFIG, RETURN_TYPE_CONFIG } from '../../redux/slices/creditNoteSlice';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

/**
 * Table listing all credit notes with filters, for internal management view.
 */
export default function CreditNoteTable({
  creditNotes = [],
  filters,
  onFilterChange,
  onViewDetail,
  pagination,
  onPageChange,
  isLoading,
}) {
  const [localSearch, setLocalSearch] = useState(filters?.search || '');

  const handleSearchChange = (value) => {
    setLocalSearch(value);
    onFilterChange?.({ search: value });
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by CN ID, pharmacy, invoice..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <select
          value={filters?.status || 'all'}
          onChange={(e) => onFilterChange?.({ status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(CN_STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={filters?.returnType || 'all'}
          onChange={(e) => onFilterChange?.({ returnType: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="EXPIRY">📅 Expiry</option>
          <option value="BREAKAGE_DAMAGE">💔 Breakage/Damage</option>
          <option value="GOOD_RETURN">✅ Good Return</option>
        </select>

        <input
          type="date"
          value={filters?.dateFrom || ''}
          onChange={(e) => onFilterChange?.({ dateFrom: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="From Date"
        />
        <input
          type="date"
          value={filters?.dateTo || ''}
          onChange={(e) => onFilterChange?.({ dateTo: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="To Date"
        />
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500">
        {isLoading ? 'Loading...' : `Showing ${creditNotes.length} of ${pagination?.total || creditNotes.length} credit notes`}
      </p>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">CN ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pharmacy</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Used</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Remaining</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : creditNotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400">
                    No credit notes found
                  </td>
                </tr>
              ) : (
                creditNotes.map((cn) => {
                  const statusConfig = CN_STATUS_CONFIG[cn.status] || CN_STATUS_CONFIG.DRAFT;
                  return (
                    <tr key={cn.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-blue-600">{cn.creditNoteId}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{cn.pharmacyName}</p>
                        <p className="text-xs text-gray-500">{cn.areaCode}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{formatDateTime(cn.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs">
                          {RETURN_TYPE_CONFIG[cn.returnType]?.icon} {RETURN_TYPE_CONFIG[cn.returnType]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`}></span>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(cn.totalAmount)}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(cn.usedAmount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{formatCurrency(cn.remainingAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onViewDetail(cn)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
