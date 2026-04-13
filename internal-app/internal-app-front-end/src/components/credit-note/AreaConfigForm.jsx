import React, { useState } from 'react';

/**
 * Area-based configuration form for credit note rules.
 */
export default function AreaConfigForm({ areaConfig, onSave, onDelete, isLoading }) {
  const isEditing = Boolean(areaConfig);

  const [form, setForm] = useState({
    areaCode: areaConfig?.areaCode || '',
    areaName: areaConfig?.areaName || '',
    city: areaConfig?.city || '',
    region: areaConfig?.region || '',
    expiryClaimWindow: areaConfig?.expiryClaimWindow || 90,
    creditUsageValidity: areaConfig?.creditUsageValidity || 180,
    enabled: areaConfig?.enabled !== false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.areaCode.trim() || !form.areaName.trim()) return;
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          {isEditing ? `Edit: ${areaConfig.areaName}` : 'Add Area Configuration'}
        </h4>
        {isEditing && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-600">Enabled</span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Area Code *</label>
          <input
            type="text"
            value={form.areaCode}
            onChange={(e) => handleChange('areaCode', e.target.value)}
            disabled={isEditing}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="e.g., NAGPUR"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Area Name *</label>
          <input
            type="text"
            value={form.areaName}
            onChange={(e) => handleChange('areaName', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Nagpur City"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Nagpur"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
          <input
            type="text"
            value={form.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Vidarbha"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Expiry Claim Window (days)
          </label>
          <input
            type="number"
            min="1"
            value={form.expiryClaimWindow}
            onChange={(e) => handleChange('expiryClaimWindow', Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-0.5">Days allowed to claim after expiry</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Credit Usage Validity (days)
          </label>
          <input
            type="number"
            min="1"
            value={form.creditUsageValidity}
            onChange={(e) => handleChange('creditUsageValidity', Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-0.5">Days credit note is valid after Ready-to-Process</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {isEditing && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(areaConfig.areaCode)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !form.areaCode.trim() || !form.areaName.trim()}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add Area Config'}
        </button>
      </div>
    </form>
  );
}
