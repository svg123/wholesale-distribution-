import React from 'react';
import { FiSearch, FiMic, FiMicOff, FiX } from 'react-icons/fi';
import useVoiceSearch from '../../hooks/useVoiceSearch';

/**
 * Reusable VoiceSearchInput component.
 *
 * Wraps a standard text input with:
 *  - Search icon (left, inside the box)
 *  - Voice-search mic button (right, flush inside the box)
 *  - Clear button (appears when text is present)
 *  - Enter key triggers `onSearch`
 *  - Listening indicator + error banner
 *
 * Props:
 *  value        – controlled string
 *  onChange      – (e) => void
 *  onSearch      – (value) => void   (called on Enter or voice result)
 *  placeholder   – string
 *  className     – additional classes for the outer wrapper
 *  inputWidth    – width class (default 'w-64')
 */
export default function VoiceSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
  inputWidth = 'w-64',
}) {
  const {
    isListening,
    isSupported,
    interimTranscript,
    error: voiceError,
    toggleListening,
    clearError,
  } = useVoiceSearch({
    onResult: (text) => {
      onChange({ target: { value: text } });
      if (onSearch) onSearch(text);
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <div className={className}>
      <div className={`relative flex items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all ${inputWidth}`}>
        {/* Search icon */}
        <FiSearch className="ml-3 w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />

        <input
          type="text"
          value={isListening ? (interimTranscript || value) : value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 py-2.5 pl-2.5 pr-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none border-none"
        />

        {/* Clear button */}
        {value && !isListening && (
          <button
            onClick={handleClear}
            className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
            title="Clear search"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}

        {/* Voice search button — flush inside the box */}
        {isSupported && (
          <button
            onClick={toggleListening}
            className={`flex-shrink-0 p-2 m-1 rounded-lg transition-all ${
              isListening
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
            }`}
            title={isListening ? 'Stop listening' : 'Voice search'}
            type="button"
          >
            {isListening ? <FiMicOff className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Voice listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '250ms' }} />
          </div>
          <span className="text-xs text-red-600 font-medium">Listening…</span>
        </div>
      )}

      {/* Voice error banner */}
      {voiceError && (
        <div className="flex items-center justify-between mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-xs text-red-700">{voiceError}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-600 ml-2" type="button">
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
