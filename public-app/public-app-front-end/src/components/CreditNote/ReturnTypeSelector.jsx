import React from 'react';

const RETURN_TYPE_CONFIG = {
  EXPIRY: {
    label: 'Expiry',
    description: 'Products that have expired or are near expiry',
    color: 'red',
    icon: '📅',
    bgClass: 'bg-red-50 border-red-200 hover:bg-red-100',
    selectedClass: 'bg-red-100 border-red-400 ring-2 ring-red-300',
  },
  BREAKAGE_DAMAGE: {
    label: 'Breakage / Damage',
    description: 'Products damaged during transit or storage',
    color: 'orange',
    icon: '💔',
    bgClass: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    selectedClass: 'bg-orange-100 border-orange-400 ring-2 ring-orange-300',
  },
  GOOD_RETURN: {
    label: 'Good Return',
    description: 'Return of undamaged, non-expired products',
    color: 'green',
    icon: '✅',
    bgClass: 'bg-green-50 border-green-200 hover:bg-green-100',
    selectedClass: 'bg-green-100 border-green-400 ring-2 ring-green-300',
  },
};

export default function ReturnTypeSelector({ selected, onSelect, enabledTypes = ['EXPIRY', 'BREAKAGE_DAMAGE', 'GOOD_RETURN'] }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Select Return Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(RETURN_TYPE_CONFIG)
          .filter(([type]) => enabledTypes.includes(type))
          .map(([type, config]) => {
            const isSelected = selected === type;
            const isDisabled = !enabledTypes.includes(type);

            return (
              <button
                key={type}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelect(type)}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? config.selectedClass
                    : isDisabled
                    ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                    : config.bgClass
                }`}
              >
                <span className="text-3xl mb-2">{config.icon}</span>
                <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">{config.description}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
