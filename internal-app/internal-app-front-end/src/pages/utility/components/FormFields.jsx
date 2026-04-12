import React from 'react';

/**
 * Reusable form input field component
 */
export function FormField({ label, name, value, onChange, type = 'text', required = false, placeholder, options, disabled = false, error, hint }) {
  const baseClasses =
    'w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  const normalClasses = `${baseClasses} border-gray-200 text-gray-900 placeholder-gray-400`;
  const errorClasses = `${baseClasses} border-red-300 text-gray-900`;
  const disabledClasses = `${baseClasses} border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={error ? errorClasses : disabled ? disabledClasses : normalClasses}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={error ? errorClasses : disabled ? disabledClasses : normalClasses}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={error ? errorClasses : disabled ? disabledClasses : normalClasses}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/**
 * Form section wrapper
 */
export function FormSection({ title, children }) {
  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}

/**
 * Form action buttons
 */
export function FormActions({ onCancel, onSave, saveLabel = 'Save', disabled = false }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
      <button
        onClick={onCancel}
        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saveLabel}
      </button>
    </div>
  );
}
