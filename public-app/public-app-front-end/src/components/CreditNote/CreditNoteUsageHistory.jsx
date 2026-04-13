import React from 'react';

/**
 * Displays usage history of a credit note — linked bills and amounts.
 */
export default function CreditNoteUsageHistory({ usageHistory = [] }) {
  if (usageHistory.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <p className="text-sm">No usage history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Usage History</h4>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Bill Number</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">Amount Used</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {usageHistory.map((entry, index) => (
              <tr key={index} className="border-t border-gray-100">
                <td className="px-3 py-2 text-gray-700">{entry.date}</td>
                <td className="px-3 py-2">
                  <span className="font-medium text-blue-600">{entry.billNumber}</span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-red-600">
                  -₹{Number(entry.amountUsed).toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  ₹{Number(entry.remainingAfter).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
