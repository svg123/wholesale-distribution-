import React, { useState } from 'react';
import AreaConfigForm from './AreaConfigForm';

/**
 * Credit Note Configuration panel for Admin/Manager.
 * Controls global settings and area-based overrides.
 */
export default function CreditNoteConfigPanel({ config, areaConfigs, onUpdateConfig, onSaveAreaConfig, onDeleteAreaConfig, isLoading }) {
  const [localConfig, setLocalConfig] = useState({
    expiryClaimWindow: config?.expiryClaimWindow || 90,
    creditUsageValidity: config?.creditUsageValidity || 180,
    enabledReturnTypes: config?.enabledReturnTypes || ['EXPIRY', 'BREAKAGE_DAMAGE', 'GOOD_RETURN'],
    partialApprovalEnabled: config?.partialApprovalEnabled !== false,
    autoApplyInBilling: config?.autoApplyInBilling !== false,
  });
  const [editingArea, setEditingArea] = useState(null);
  const [showNewArea, setShowNewArea] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (field, value) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleReturnTypeToggle = (type) => {
    setLocalConfig((prev) => ({
      ...prev,
      enabledReturnTypes: prev.enabledReturnTypes.includes(type)
        ? prev.enabledReturnTypes.filter((t) => t !== type)
        : [...prev.enabledReturnTypes, type],
    }));
    setHasChanges(true);
  };

  const handleSaveConfig = () => {
    onUpdateConfig(localConfig);
    setHasChanges(false);
  };

  const returnTypes = [
    { key: 'EXPIRY', label: 'Expiry', icon: '📅', description: 'Allow credit notes for expired products' },
    { key: 'BREAKAGE_DAMAGE', label: 'Breakage/Damage', icon: '💔', description: 'Allow credit notes for damaged products' },
    { key: 'GOOD_RETURN', label: 'Good Return', icon: '✅', description: 'Allow credit notes for good returns' },
  ];

  return (
    <div className="space-y-6">
      {/* Global Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Global Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expiry Claim Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Claim Window (days)
            </label>
            <input
              type="number"
              min="1"
              value={localConfig.expiryClaimWindow}
              onChange={(e) => handleConfigChange('expiryClaimWindow', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Days allowed to raise credit note after product expiry date
            </p>
          </div>

          {/* Credit Usage Validity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Usage Validity (days)
            </label>
            <input
              type="number"
              min="1"
              value={localConfig.creditUsageValidity}
              onChange={(e) => handleConfigChange('creditUsageValidity', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Days credit note remains valid after Ready-to-Process status
            </p>
          </div>
        </div>

        {/* Return Types */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enabled Return Types
          </label>
          <div className="space-y-2">
            {returnTypes.map((type) => (
              <label
                key={type.key}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  localConfig.enabledReturnTypes.includes(type.key)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={localConfig.enabledReturnTypes.includes(type.key)}
                    onChange={() => handleReturnTypeToggle(type.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg">{type.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="mt-6 space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Partial Approval</p>
              <p className="text-xs text-gray-500">Allow approvers to approve partial quantities</p>
            </div>
            <button
              type="button"
              onClick={() => handleConfigChange('partialApprovalEnabled', !localConfig.partialApprovalEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localConfig.partialApprovalEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localConfig.partialApprovalEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></span>
            </button>
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-Apply in Billing</p>
              <p className="text-xs text-gray-500">Automatically suggest credit notes during billing</p>
            </div>
            <button
              type="button"
              onClick={() => handleConfigChange('autoApplyInBilling', !localConfig.autoApplyInBilling)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localConfig.autoApplyInBilling ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localConfig.autoApplyInBilling ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></span>
            </button>
          </label>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}
      </div>

      {/* Area-Based Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Area-Based Rules</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure rules per area. Area rules override global defaults.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingArea(null);
              setShowNewArea(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            + Add Area
          </button>
        </div>

        {/* Existing Area Configs */}
        {areaConfigs.length === 0 && !showNewArea ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No area-specific configurations yet</p>
            <p className="text-xs mt-1">Global defaults apply to all areas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {areaConfigs.map((area) => (
              <div
                key={area.areaCode}
                className={`border rounded-lg p-4 ${
                  area.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {area.areaName} <span className="text-gray-400">({area.areaCode})</span>
                    </h4>
                    <p className="text-xs text-gray-500">
                      {area.city}{area.region ? ` — ${area.region}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingArea(area);
                        setShowNewArea(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteAreaConfig(area.areaCode)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Expiry Window:</span>{' '}
                    <span className="font-semibold">{area.expiryClaimWindow} days</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Usage Validity:</span>{' '}
                    <span className="font-semibold">{area.creditUsageValidity} days</span>
                  </div>
                </div>
              </div>
            ))}

            {/* New/Edit Area Form */}
            {showNewArea && (
              <AreaConfigForm
                areaConfig={editingArea}
                onSave={(data) => {
                  onSaveAreaConfig(data);
                  setShowNewArea(false);
                  setEditingArea(null);
                }}
                onDelete={(areaCode) => {
                  onDeleteAreaConfig(areaCode);
                  setShowNewArea(false);
                  setEditingArea(null);
                }}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
