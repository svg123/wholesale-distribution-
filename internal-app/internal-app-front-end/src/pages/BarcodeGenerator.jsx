import React, { useState, useRef, useEffect } from 'react';
import { FiPrinter, FiDownload } from 'react-icons/fi';
import VoiceSearchInput from '../components/common/VoiceSearchInput';
import { PageLoader } from '../components/common/LoadingSpinner';

export default function BarcodeGeneratorPage() {
  const [orderId, setOrderId] = useState('');
  const [barcode, setBarcode] = useState(null);
  const [generating, setGenerating] = useState(false);
  const barcodeRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setGenerating(true);
    // TODO: Replace with actual API call + JsBarcode
    setTimeout(() => {
      setBarcode({
        id: 'BC-20260408001',
        orderId: orderId,
        value: orderId.replace(/-/g, ''),
        format: 'CODE128',
        generatedAt: new Date().toISOString(),
      });
      setGenerating(false);
    }, 600);
  };

  useEffect(() => {
    if (barcode && barcodeRef.current) {
      // Simple visual representation for now
      // When JsBarcode is installed, use: JsBarcode(barcodeRef.current, barcode.value, { format: "CODE128", ... })
    }
  }, [barcode]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement SVG/PNG download using JsBarcode output
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Barcode Generator</h1>
        <p className="page-subtitle">Generate barcodes for order cartons</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleGenerate} className="flex items-center gap-3">
            <VoiceSearchInput
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onSearch={(val) => { setOrderId(val); handleGenerate({ preventDefault: () => {} }); }}
              placeholder="Enter Order ID to generate barcode"
              inputWidth="w-full"
            />
            <button type="submit" disabled={generating} className="btn-primary flex-shrink-0">
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </form>
        </div>
      </div>

      {/* Barcode Display */}
      {barcode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">Generated Barcode</h3>
            </div>
            <div className="card-body flex flex-col items-center justify-center py-12">
              {/* Barcode visual */}
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 w-full max-w-md">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-3">{barcode.format}</p>
                  {/* Visual barcode representation */}
                  <div className="flex justify-center items-end gap-px h-20 mb-3">
                    {barcode.value.split('').map((char, i) => (
                      <div key={i} className="bg-gray-900 rounded-sm" style={{
                        width: Math.random() > 0.5 ? 3 : 2,
                        height: `${60 + Math.random() * 40}%`,
                      }} />
                    ))}
                  </div>
                  <p className="text-sm font-mono text-gray-700 tracking-widest">{barcode.value}</p>
                  <p className="text-xs text-gray-400 mt-2">{barcode.orderId}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button onClick={handlePrint} className="btn-secondary">
                  <FiPrinter className="w-4 h-4 mr-2" /> Print
                </button>
                <button onClick={handleDownload} className="btn-primary">
                  <FiDownload className="w-4 h-4 mr-2" /> Download PNG
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">Details</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <p className="text-xs text-gray-500">Barcode ID</p>
                <p className="text-sm font-medium text-gray-900">{barcode.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="text-sm font-medium text-gray-900">{barcode.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Format</p>
                <p className="text-sm font-medium text-gray-900">{barcode.format}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Generated</p>
                <p className="text-sm font-medium text-gray-900">{new Date(barcode.generatedAt).toLocaleString()}</p>
              </div>

              {/* Print Settings */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Print Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="label">Size</label>
                    <select className="select-field" defaultValue="standard">
                      <option value="small">Small (50×100mm)</option>
                      <option value="standard">Standard (80×150mm)</option>
                      <option value="large">Large (100×200mm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Format</label>
                    <select className="select-field" defaultValue="png">
                      <option value="png">PNG</option>
                      <option value="svg">SVG</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
