import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeSchemeModal } from '../../redux/slices/orderPlacementSlice';

const SchemeModal = () => {
  const dispatch = useDispatch();
  const { schemeModalOpen, activeScheme } = useSelector((state) => state.orderPlacement);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && schemeModalOpen) {
        dispatch(closeSchemeModal());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [schemeModalOpen, dispatch]);

  if (!schemeModalOpen || !activeScheme) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      dispatch(closeSchemeModal());
    }
  };

  // Calculate examples
  const examples = [
    { quantity: activeScheme.buy, free: activeScheme.free },
    { quantity: activeScheme.buy * 2, free: activeScheme.free * 2 },
    { quantity: activeScheme.buy * 3, free: activeScheme.free * 3 },
    { quantity: activeScheme.buy * 5, free: activeScheme.free * 5 },
    { quantity: activeScheme.buy * 10, free: activeScheme.free * 10 },
  ];

  // Add non-exact examples
  const nonExactExamples = [
    { quantity: Math.floor(activeScheme.buy * 1.5), free: activeScheme.free },
    { quantity: Math.floor(activeScheme.buy * 2.7), free: activeScheme.free * 2 },
    { quantity: activeScheme.buy + Math.floor(activeScheme.buy / 2), free: activeScheme.free },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Scheme Details</h2>
                <p className="text-orange-100 text-sm">Understanding the offer benefits</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(closeSchemeModal())}
              className="text-white hover:text-orange-100 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Scheme Overview */}
          <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Special Offer</p>
              <div className="flex items-center justify-center gap-4">
                <div className="bg-blue-600 text-white px-8 py-4 rounded-lg">
                  <p className="text-sm font-medium">Buy</p>
                  <p className="text-4xl font-bold">{activeScheme.buy}</p>
                </div>
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                <div className="bg-green-600 text-white px-8 py-4 rounded-lg">
                  <p className="text-sm font-medium">Get Free</p>
                  <p className="text-4xl font-bold">{activeScheme.free}</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-orange-800 mt-4">
                Buy {activeScheme.buy} units and get {activeScheme.free} unit{activeScheme.free > 1 ? 's' : ''} absolutely FREE!
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <p className="text-gray-700">
                    For every <strong>{activeScheme.buy} units</strong> you purchase, you automatically receive <strong>{activeScheme.free} unit{activeScheme.free > 1 ? 's' : ''} free</strong>
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <p className="text-gray-700">
                    The free quantity is calculated automatically based on your order quantity
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <p className="text-gray-700">
                    You only pay for the purchased quantity; free items have no additional cost
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                  <p className="text-gray-700">
                    If your quantity doesn't match exactly, you'll get free units for complete sets
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Exact Multiples Examples */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Examples (Exact Multiples)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Purchase</span>
                    <span className="text-2xl font-bold text-blue-600">{example.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">You receive</span>
                  </div>
                  <div className="bg-green-600 text-white rounded-lg px-3 py-2 text-center">
                    <p className="text-xs font-medium">Free Units</p>
                    <p className="text-2xl font-bold">{example.free}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-300">
                    <p className="text-xs text-gray-600">
                      <strong>Total: {example.quantity + example.free}</strong> units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Exact Examples */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Examples (Non-Exact Quantities)
            </h3>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-3">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> When quantity doesn't match exactly, you get free units for complete sets only.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nonExactExamples.map((example, index) => {
                const totalReceived = example.quantity + example.free;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Purchase</span>
                      <span className="text-2xl font-bold text-blue-600">{example.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">You receive</span>
                    </div>
                    <div className="bg-yellow-600 text-white rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-medium">Free Units</p>
                      <p className="text-2xl font-bold">{example.free}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-yellow-300">
                      <p className="text-xs text-gray-600">
                        <strong>Total: {totalReceived}</strong> units
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ({Math.floor(example.quantity / activeScheme.buy)} complete set{Math.floor(example.quantity / activeScheme.buy) !== 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formula */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculation Formula
            </h3>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <code className="text-sm text-gray-800 block mb-3">
                Free Quantity = Math.floor(Purchase Quantity / {activeScheme.buy}) × {activeScheme.free}
              </code>
              <p className="text-sm text-gray-600">
                This formula calculates how many complete sets of {activeScheme.buy} units you're buying, 
                then multiplies by {activeScheme.free} to get your free quantity.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd> to close
            </p>
            <button
              onClick={() => dispatch(closeSchemeModal())}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       font-semibold transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeModal;
