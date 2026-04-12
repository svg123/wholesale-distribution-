import React, { useState, useEffect } from 'react';

export default function BatchEntryTable({ products, stockData, onSave, onCancel }) {
  const [batches, setBatches] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize batches for each product
  useEffect(() => {
    const initialBatches = products.map(product => ({
      productId: product.id,
      productName: product.name,
      companyName: product.companyName,
      requiredQty: product.requiredQty,
      filledQty: 0,
      batches: []
    }));
    setBatches(initialBatches);
  }, [products]);

  const handleBatchAdd = (productIndex) => {
    const newBatch = {
      batchNumber: '',
      qty: 0,
      expiryDate: '',
      batchQty: 0
    };
    setBatches(prev => {
      const newBatches = [...prev];
      newBatches[productIndex].batches.push(newBatch);
      return newBatches;
    });
  };

  const handleBatchChange = (productIndex, batchIndex, field, value) => {
    const newBatches = [...batches];
    newBatches[productIndex].batches[batchIndex][field] = value;

    // If batch number changes, look up expiry date and available qty from stock
    if (field === 'batchNumber' && value) {
      const stock = stockData.find(s =>
        s.productName === newBatches[productIndex].productName &&
        s.batchNumber === value.toUpperCase()
      );
      if (stock) {
        newBatches[productIndex].batches[batchIndex].expiryDate = stock.expiryDate;
        newBatches[productIndex].batches[batchIndex].batchQty = stock.qty;
      }
    }

    // Calculate total filled qty
    let totalFilled = 0;
    newBatches[productIndex].batches.forEach(b => {
      totalFilled += parseInt(b.qty) || 0;
    });
    newBatches[productIndex].filledQty = totalFilled;

    setBatches(newBatches);
    setErrors(prev => ({
      ...prev,
      [productIndex]: prev[productIndex]?.totalQtyError
    }));
  };

  const handleBatchRemove = (productIndex, batchIndex) => {
    setBatches(prev => {
      const newBatches = [...prev];
      const removed = newBatches[productIndex].batches[batchIndex];
      newBatches[productIndex].batches.splice(batchIndex, 1);

      // Recalculate total filled qty
      let totalFilled = 0;
      newBatches[productIndex].batches.forEach(b => {
        totalFilled += parseInt(b.qty) || 0;
      });
      newBatches[productIndex].filledQty = totalFilled;

      return newBatches;
    });
  };

  const handleSave = () => {
    // Validate all batches
    const newErrors = {};
    let isValid = true;

    batches.forEach((product, productIndex) => {
      const totalFilled = product.batches.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0);
      product.filledQty = totalFilled;

      // Validate total filled qty equals required qty
      if (totalFilled !== product.requiredQty) {
        newErrors[productIndex] = `Total filled (${totalFilled}) must equal required (${product.requiredQty})`;
        isValid = false;
      }

      // Validate batch numbers are entered
      product.batches.forEach((batch, batchIndex) => {
        if (!batch.batchNumber.trim()) {
          if (!newErrors[productIndex]) newErrors[productIndex] = [];
          newErrors[productIndex].push(`Batch ${batchIndex + 1}: Batch number required`);
        }
      });
    });

    setErrors(newErrors);

    if (isValid) {
      setIsSaving(true);
      onSave(batches.map(p => ({
        productId: p.productId,
        productName: p.productName,
        companyName: p.companyName,
        requiredQty: p.requiredQty,
        filledQty: p.filledQty,
        batches: p.batches.map(b => ({
          batchNumber: b.batchNumber,
          qty: b.qty,
          expiryDate: b.expiryDate
        }))
      })));
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      onCancel();
    }
  };

  const getTotalFilled = (productIndex) => {
    return batches[productIndex].batches.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0);
  };

  const getValidationStatus = (productIndex) => {
    const totalFilled = getTotalFilled(productIndex);
    const requiredQty = batches[productIndex].requiredQty;
    if (totalFilled === 0) return { text: 'Not started', color: 'text-gray-400' };
    if (totalFilled === requiredQty) return { text: '✓ Complete', color: 'text-green-600' };
    if (totalFilled < requiredQty) return { text: `${totalFilled}/${requiredQty}`, color: 'text-yellow-600' };
    return { text: '⚠ Overfilled', color: 'text-red-600' };
  };

  return (
    <div className="space-y-4">
      {/* Products Header */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base font-semibold text-gray-900">Products to Fill</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
            <div className="col-span-5">Product Name</div>
            <div className="col-span-2 text-center">Required Qty</div>
            <div className="col-span-2 text-center">Filled</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1"></div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {batches.map((product, productIndex) => {
          const validationStatus = getValidationStatus(productIndex);

          return (
            <div key={productIndex} className="card">
              <div className="card-header">
                <h4 className="text-sm font-semibold text-gray-900">
                  {product.productName} ({product.companyName})
                </h4>
                <span className={`text-sm font-semibold ${validationStatus.color}`}>
                  {validationStatus.text}
                </span>
              </div>
              <div className="card-body">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Fill Progress</span>
                    <span>{getTotalFilled(productIndex)}/{product.requiredQty}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getTotalFilled(productIndex) === product.requiredQty
                          ? 'bg-green-500'
                          : getTotalFilled(productIndex) < product.requiredQty
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(getTotalFilled(productIndex) / product.requiredQty) * 100}%` }}
                    />
                  </div>
                  {errors[productIndex] && (
                    <p className="text-xs text-red-500 mt-1">{errors[productIndex]}</p>
                  )}
                </div>

                {/* Batch Entries */}
                <div className="space-y-2">
                  {product.batches.map((batch, batchIndex) => (
                    <div key={batchIndex} className="grid grid-cols-12 gap-3 items-end">
                      {/* Batch Number */}
                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Batch Number</label>
                        <input
                          type="text"
                          value={batch.batchNumber}
                          onChange={(e) => handleBatchChange(productIndex, batchIndex, 'batchNumber', e.target.value.toUpperCase())}
                          placeholder="e.g., AZER5089R"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Qty */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                        <input
                          type="number"
                          value={batch.qty}
                          onChange={(e) => handleBatchChange(productIndex, batchIndex, 'qty', e.target.value)}
                          min="1"
                          max={batch.batchQty}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Expiry */}
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={batch.expiryDate}
                          readOnly
                          placeholder="Auto-filled from stock"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                        />
                      </div>

                      {/* Batch Total */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Batch Qty</label>
                        <input
                          type="text"
                          value={batch.batchQty || '0'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1">
                        {product.batches.length > 1 && (
                          <button
                            onClick={() => handleBatchRemove(productIndex, batchIndex)}
                            className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove batch"
                          >
                            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Batch Button */}
                  <button
                    onClick={() => handleBatchAdd(productIndex)}
                    className="w-full mt-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    + Add Another Batch
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Validate & Lock'
          )}
        </button>
      </div>
    </div>
  );
}
