import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { selectProduct, setSearchResults, clearSearchResults } from '../../redux/slices/orderPlacementSlice';
import { searchProducts } from '../../services/mockProductsData';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import VoiceSearchButton, { VoiceErrorToast, BrowserCompatBanner } from './VoiceSearchButton';

const SearchBar = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Toast auto-dismiss state
  const [showCompatBanner, setShowCompatBanner] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Voice recognition: called when a final transcript is available
  const handleVoiceResult = useCallback((text) => {
    setSearchQuery(text);
    // The debounce effect on searchQuery will auto-trigger search
  }, []);

  // Voice recognition: called for interim (real-time) results
  const handleVoiceInterim = useCallback((text) => {
    // Interim text shown via the input display value — no state change to searchQuery
    // until final result arrives (to avoid firing premature searches)
  }, []);

  const {
    isListening,
    isSupported: isVoiceSupported,
    transcript: voiceTranscript,
    interimTranscript: voiceInterim,
    error: voiceError,
    errorDetail: voiceErrorDetail,
    toggleListening,
    clearError,
  } = useVoiceRecognition({ onResult: handleVoiceResult, onInterim: handleVoiceInterim });

  // Show toast when error occurs, auto-dismiss after 8 seconds
  useEffect(() => {
    if (voiceError && voiceErrorDetail) {
      setShowErrorToast(true);
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowErrorToast(false);
        clearError();
      }, 8000);
    }
    return () => clearTimeout(toastTimerRef.current);
  }, [voiceError, voiceErrorDetail, clearError]);

  // The value shown in the input: interim text while listening, else searchQuery
  const displayValue = isListening && voiceInterim
    ? voiceInterim
    : searchQuery;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const searchResults = searchProducts(searchQuery);
        setResults(searchResults);
        setShowDropdown(true);
        dispatch(setSearchResults(searchResults));
        setIsTyping(false);
      } else {
        setResults([]);
        setShowDropdown(false);
        dispatch(clearSearchResults());
        setIsTyping(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    setIsTyping(true);
  };

  const handleProductSelect = (product) => {
    dispatch(selectProduct(product));
    setSearchQuery('');
    setShowDropdown(false);
    setResults([]);
    setSelectedIndex(-1);
    dispatch(clearSearchResults());
    
    // Focus back on input for next search
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleProductSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  const getCategoryColor = (category) => {
    const colors = {
      Ethical: 'bg-purple-100 text-purple-800',
      Generic: 'bg-blue-100 text-blue-800',
      OTC: 'bg-green-100 text-green-800',
      Standard: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatus = (stock) => {
    if (stock > 1000) return { color: 'text-green-600', text: 'In Stock' };
    if (stock > 200) return { color: 'text-yellow-600', text: 'Low Stock' };
    return { color: 'text-red-600', text: 'Critical' };
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Browser Compatibility Banner */}
      {!isVoiceSupported && showCompatBanner && (
        <BrowserCompatBanner onDismiss={() => setShowCompatBanner(false)} />
      )}

      {/* Voice Error Toast */}
      {showErrorToast && voiceErrorDetail && (
        <VoiceErrorToast
          error={voiceError}
          errorDetail={voiceErrorDetail}
          onRetry={voiceErrorDetail.retryable ? () => { clearError(); toggleListening(); } : undefined}
          onDismiss={() => { setShowErrorToast(false); clearError(); }}
        />
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search by Product Name or Code (e.g., Paracetamol or MED001)"
          className={`
            w-full px-4 py-3 pl-10 sm:pl-12 pr-14 sm:pr-16 text-sm sm:text-base
            border-2 rounded-lg transition-all duration-200
            ${
              isListening
                ? 'border-red-400 animate-input-border-glow bg-red-50/30'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }
            focus:outline-none
          `}
          autoComplete="off"
          readOnly={isListening}
        />
        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Right-side controls: typing indicator + voice button */}
        <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {isTyping && !isListening && (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-500"></div>
          )}
          <VoiceSearchButton
            isListening={isListening}
            onClick={toggleListening}
            isSupported={isVoiceSupported}
          />
        </div>

        {/* Listening status bar — shows below input on all screen sizes */}
        {isListening && (
          <div className="mt-2 flex items-center gap-2.5 px-1">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            {voiceInterim ? (
              <p className="text-xs sm:text-sm text-red-500 font-medium truncate animate-text-shimmer">
                {voiceInterim}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-red-500 font-medium">
                Listening for your search...
              </p>
            )}
            <button
              onClick={toggleListening}
              className="ml-auto flex-shrink-0 text-xs text-red-500 hover:text-red-700
                         font-medium px-2 py-0.5 rounded-md hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Dropdown with search results */}
      {showDropdown && results.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg 
                   shadow-lg max-h-96 overflow-y-auto"
        >
          {results.map((product, index) => {
            const stockStatus = getStockStatus(product.stock);
            const isSelected = index === selectedIndex;
            
            return (
              <div
                key={product.productCode}
                onClick={() => handleProductSelect(product)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0
                          transition-colors duration-150
                          ${isSelected 
                            ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                            : 'hover:bg-gray-50'
                          }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {product.productName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="space-y-0.5 text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {product.productCode}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {product.companyName}
                        </span>
                      </div>
                      {product.composition && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="italic">{product.composition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 ml-4">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{product.pricePerUnit.toFixed(2)}
                    </span>
                    <span className={`text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}: {product.stock}
                    </span>
                    {product.scheme && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                        {product.scheme.buy}+{product.scheme.free} Free
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {showDropdown && results.length === 0 && searchQuery.length >= 2 && !isTyping && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try searching with different keywords</p>
          </div>
        </div>
      )}

      {/* Search hint */}
      {searchQuery.length === 0 && !isListening && (
        <div className="mt-2 flex flex-col xs:flex-row text-xs text-gray-500 gap-1 xs:gap-4 xs:items-center">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Use ↑↓ arrows to navigate, Enter to select, Esc to close</span>
            <span className="sm:hidden">Type or tap mic to search</span>
          </span>
          {isVoiceSupported && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
              </svg>
              Click the microphone icon to search by voice
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
