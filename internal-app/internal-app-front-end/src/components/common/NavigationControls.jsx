import React from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

/**
 * NavigationControls — minimal Back / Forward buttons for in-app navigation.
 *
 * Props:
 *  - canGoBack   (bool) — enables/disables the back button
 *  - canGoForward (bool) — enables/disables the forward button
 *  - onBack       (fn)   — callback for back navigation
 *  - onForward    (fn)   — callback for forward navigation
 */
export default function NavigationControls({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}) {
  return (
    <div className="flex items-center gap-1">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        title={canGoBack ? 'Go Back' : 'No previous page'}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            canGoBack
              ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }
        `}
      >
        <FiArrowLeft className="w-4 h-4" />
      </button>

      {/* Forward Button */}
      <button
        onClick={onForward}
        disabled={!canGoForward}
        title={canGoForward ? 'Go Forward' : 'No next page'}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            canGoForward
              ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }
        `}
      >
        <FiArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
