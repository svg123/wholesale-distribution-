import React, { useState, useMemo } from 'react';
import { CN_STATUS_CONFIG } from '../../redux/slices/creditNoteSlice';
import CreditNoteStatusBadge from './CreditNoteStatusBadge';

/**
 * Filterable, paginated list of credit notes.
 */
export default function CreditNoteList({ creditNotes = [], filters, onFilterChange, onViewCreditNote, pagination, onPageChange }) {
  const [localSearch, setLocalSearch] = useState(filters?.search || '');

  const filteredNotes = useMemo(() => {
    let result = creditNotes;

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((cn) => cn.status === filters.status);
    }
    if (filters?.returnType && filters.returnType !== 'all') {
      result = result.filter((cn) => cn.returnType === filters.returnType);
    }
    if (localSearch.trim()) {
      const term = localSearch.toLowerCase();
      result = result.filter(
        (cn) =>
          cn.creditNoteId?.toLowerCase().includes(term) ||
          cn.invoiceNumber?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [creditNotes, filters, localSearch]);

  // Pagination
  const totalPages = Math.ceil((pagination?.total || filteredNotes.length) / (pagination?.limit || 10));
  const paginatedNotes = filteredNotes.slice(
    ((pagination?.page || 1) - 1) * (pagination?.limit || 10),
    (pagination?.page || 1) * (pagination?.limit || 10)
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by CN ID or Invoice..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Status Filter */}
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

        {/* Return Type Filter */}
        <select
          value={filters?.returnType || 'all'}
          onChange={(e) => onFilterChange?.({ returnType: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="EXPIRY">Expiry</option>
          <option value="BREAKAGE_DAMAGE">Breakage/Damage</option>
          <option value="GOOD_RETURN">Good Return</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {paginatedNotes.length} of {pagination?.total || filteredNotes.length} credit notes
      </p>

      {/* Table */}
      {paginatedNotes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-medium">No credit notes found</p>
          <p className="text-sm mt-1">Create a new credit note to get started</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">CN ID</th>
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
                {paginatedNotes.map((cn) => (
                  <tr key={cn.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-blue-600">{cn.creditNoteId}</td>
                    <td className="px-4 py-3 text-gray-600">{cn.createdAt}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{cn.returnType === 'EXPIRY' ? '📅' : cn.returnType === 'BREAKAGE_DAMAGE' ? '💔' : '✅'}</span>
                      {' '}{cn.returnType?.replace('_', '/')}
                    </td>
                    <td className="px-4 py-3">
                      <CreditNoteStatusBadge status={cn.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ₹{Number(cn.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      ₹{Number(cn.usedAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      ₹{Number(cn.remainingAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewCreditNote(cn)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Page {pagination?.page || 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.((pagination?.page || 1) - 1)}
              disabled={(pagination?.page || 1) <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.((pagination?.page || 1) + 1)}
              disabled={(pagination?.page || 1) >= totalPages}
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
