import React from 'react';
import { FiSave } from 'react-icons/fi';

export default function SystemConfigPage() {
  const configSections = [
    {
      title: 'General Settings',
      fields: [
        { key: 'company_name', label: 'Company Name', type: 'text', value: 'Pharma Wholesale Corp', disabled: false },
        { key: 'system_email', label: 'System Email', type: 'email', value: 'system@pharma.com', disabled: false },
        { key: 'timezone', label: 'Timezone', type: 'select', value: 'Asia/Kolkata', options: ['Asia/Kolkata', 'UTC'] },
      ],
    },
    {
      title: 'Order Settings',
      fields: [
        { key: 'order_prefix', label: 'Order ID Prefix', type: 'text', value: 'ORD', disabled: false },
        { key: 'max_order_items', label: 'Max Items per Order', type: 'number', value: '100', disabled: false },
        { key: 'auto_dispatch', label: 'Auto-Dispatch', type: 'select', value: 'disabled', options: ['enabled', 'disabled'] },
      ],
    },
    {
      title: 'Barcode Settings',
      fields: [
        { key: 'barcode_format', label: 'Barcode Format', type: 'select', value: 'CODE128', options: ['CODE128', 'EAN13', 'QR'] },
        { key: 'default_size', label: 'Default Print Size', type: 'select', value: 'standard', options: ['small', 'standard', 'large'] },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">System Configuration</h1>
          <p className="page-subtitle">Manage application and module settings</p>
        </div>
        <button className="btn-primary">
          <FiSave className="w-4 h-4 mr-2" /> Save All Changes
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {configSections.map((section) => (
          <div key={section.title} className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
            </div>
            <div className="card-body space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <div className="col-span-2">
                    {field.type === 'select' ? (
                      <select className="select-field" defaultValue={field.value}>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="input-field"
                        defaultValue={field.value}
                        disabled={field.disabled}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
