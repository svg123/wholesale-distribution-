import React, { useState, useMemo } from 'react';

export default function InvoiceSelector({ invoices, selectedInvoiceId, onSelect, isLoading }) {
  const [search, setSearch] = useState('');

  const filteredInvoices = useMemo(() => {
    if (!search.trim()) return invoices;
    const term = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber?.toLowerCase().includes(term) ||
        inv.orderDate?.includes(term) ||
        String(inv.amount)?.includes(term)
    );
  }, [invoices, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading invoices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Select Invoice <span className="text-red-500">*</span>
      </label>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by invoice number, date, or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Invoice List */}
      <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No invoices found</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <button
              key={invoice.id}
              type="button"
              onClick={() => onSelect(invoice.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                selectedInvoiceId === invoice.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-600'
                  : 'hover:bg-gray-50 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {invoice.orderDate} &bull; {invoice.itemCount || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{Number(invoice.amount || 0).toLocaleString('en-IN')}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      invoice.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {invoice.status || 'Completed'}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {invoices.length > 0 && (
        <p className="text-xs text-gray-400">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
      )}
    </div>
  );
}
