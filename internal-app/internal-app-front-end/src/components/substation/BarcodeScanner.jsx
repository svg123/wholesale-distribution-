import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BarcodeScanner({ onScan, onClose, placeholder = 'Scan barcode...' }) {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const navigate = useNavigate();

  // Simulate barcode scanner input (in real implementation, this would use a camera + library)
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        // Simulate barcode scanning - auto-fill with a sample barcode
        const sampleBarcodes = ['ORD00120260409', 'ORD00220260409', 'ORD00320260409'];
        const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
        setBarcode(randomBarcode);
        setIsScanning(false);
        handleScan(randomBarcode);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isScanning, handleScan]);

  const handleScan = (value = barcode) => {
    if (value.trim()) {
      onScan(value.trim());
      setBarcode('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Barcode Scanner</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="flex flex-col items-center gap-4">
          {/* Scanner Visual */}
          <div
            className={`relative w-64 h-40 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
              isScanning
                ? 'border-primary-500 bg-primary-50 animate-pulse'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            {/* Scanner Line */}
            {isScanning && (
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-primary-600 animate-[scan_2s_ease-in-out_infinite]" />
            )}

            {/* Scanner Icons */}
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="text-sm text-gray-500">
                {isScanning ? 'Scanning...' : 'Ready to Scan'}
              </span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="w-full max-w-md">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={() => setIsScanning(!isScanning)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isScanning
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isScanning ? 'Stop Scan' : 'Start Scan'}
              </button>
              <button
                onClick={() => handleScan()}
                disabled={!barcode.trim()}
                className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Scan Now
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            <p>• Press Enter to scan</p>
            <p>• Scanner auto-scans every 3 seconds when enabled</p>
            <p>• In production, connect physical barcode scanner</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add scan animation
const styles = document.createElement('style');
styles.textContent = `
  @keyframes scan {
    0%, 100% { top: 4px; }
    50% { top: 132px; }
  }
`;
document.head.appendChild(styles);
