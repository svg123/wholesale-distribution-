import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Partial approval component — allows approver to adjust quantities per item.
 */
export default function PartialApproval({ items = [], onItemsChange }) {
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    setLocalItems(
      items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        batchNumber: item.batchNumber,
        requestedQty: item.quantity,
        approvedQty: item.quantity, // Default to full approval
        unitPrice: item.unitPrice,
        maxQty: item.quantity,
        action: 'APPROVE', // APPROVE or REJECT per item
      }))
    );
  }, [items]);

  useEffect(() => {
    onItemsChange?.(localItems);
  }, [localItems, onItemsChange]);

  const handleQtyChange = (index, value) => {
    const newItems = [...localItems];
    const qty = Math.min(Math.max(0, Number(value)), newItems[index].maxQty);
    newItems[index] = {
      ...newItems[index],
      approvedQty: qty,
      action: qty === 0 ? 'REJECT' : qty === newItems[index].maxQty ? 'APPROVE' : 'PARTIAL',
    };
    setLocalItems(newItems);
  };

  const handleItemAction = (index, action) => {
    const newItems = [...localItems];
    if (action === 'REJECT') {
      newItems[index] = { ...newItems[index], approvedQty: 0, action: 'REJECT' };
    } else if (action === 'APPROVE') {
      newItems[index] = { ...newItems[index], approvedQty: newItems[index].maxQty, action: 'APPROVE' };
    }
    setLocalItems(newItems);
  };

  const totalRequested = localItems.reduce((sum, i) => sum + i.requestedQty * i.unitPrice, 0);
  const totalApproved = localItems.reduce((sum, i) => sum + i.approvedQty * i.unitPrice, 0);

  return (
    <div className="mt-3 border border-amber-200 rounded-lg p-3 bg-amber-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Adjust Quantities</h4>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-600">Requested: <strong>{formatCurrency(totalRequested)}</strong></span>
          <span className={totalApproved < totalRequested ? 'text-amber-600' : 'text-green-600'}>
            Approved: <strong>{formatCurrency(totalApproved)}</strong>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {localItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-200">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{item.productName}</p>
              <p className="text-xs text-gray-500">{item.batchNumber} &bull; {formatCurrency(item.unitPrice)}/unit</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick Action Buttons */}
              <button
                type="button"
                onClick={() => handleItemAction(index, 'APPROVE')}
                className={`px-2 py-1 text-xs rounded font-medium ${
                  item.action === 'APPROVE'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-100 text-gray-500 hover:bg-green-100'
                }`}
              >
                Full
              </button>
              <button
                type="button"
                onClick={() => handleItemAction(index, 'REJECT')}
                className={`px-2 py-1 text-xs rounded font-medium ${
                  item.action === 'REJECT'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-gray-100 text-gray-500 hover:bg-red-100'
                }`}
              >
                Reject
              </button>
              <input
                type="number"
                min="0"
                max={item.maxQty}
                value={item.approvedQty}
                onChange={(e) => handleQtyChange(index, e.target.value)}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">/{item.maxQty}</span>
            </div>
          </div>
        ))}
      </div>

      {totalApproved < totalRequested && (
        <p className="text-xs text-amber-600 mt-2 font-medium">
          ⚠️ Partial approval: {formatCurrency(totalRequested - totalApproved)} will be rejected
        </p>
      )}
    </div>
  );
}
