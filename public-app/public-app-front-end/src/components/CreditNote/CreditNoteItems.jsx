import React from 'react';
import { CN_STATUS_CONFIG, RETURN_TYPE_CONFIG } from '../../redux/slices/creditNoteSlice';

/**
 * Displays the list of items added to a credit note with edit/remove capabilities.
 */
export default function CreditNoteItems({ items = [], onUpdateItem, onRemoveItem, isEditable = true }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm">No products added yet</p>
        <p className="text-xs mt-1">Select products and batches from above to add items</p>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Credit Note Items ({items.length})
      </label>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 font-medium text-gray-600">Product</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Batch</th>
              <th className="text-center px-3 py-2 font-medium text-gray-600">Qty</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">Unit Price</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
              {isEditable && <th className="text-center px-3 py-2 font-medium text-gray-600">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.companyName}</p>
                  {item.expiryDate && (
                    <p className="text-xs text-red-500">Exp: {item.expiryDate}</p>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{item.batchNumber}</span>
                </td>
                <td className="px-3 py-2 text-center">
                  {isEditable ? (
                    <input
                      type="number"
                      min="1"
                      max={item.maxQuantity}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = Math.min(Number(e.target.value), item.maxQuantity);
                        onUpdateItem(index, { quantity: newQty > 0 ? newQty : 1 });
                      }}
                      className="w-16 text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="font-medium">{item.quantity}</span>
                  )}
                  <span className="text-xs text-gray-400 block">/{item.maxQuantity}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  ₹{Number(item.unitPrice).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                  ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                {isEditable && (
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td colSpan={4} className="px-3 py-3 text-right text-gray-700">
                Total Credit Amount:
              </td>
              <td className="px-3 py-3 text-right text-blue-600 text-lg">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              {isEditable && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
