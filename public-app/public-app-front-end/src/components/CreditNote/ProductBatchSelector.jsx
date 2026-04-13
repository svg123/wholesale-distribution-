import React, { useState } from 'react';

/**
 * Product and Batch Selection component.
 * Allows selecting products from an invoice and choosing batches with quantity validation.
 */
export default function ProductBatchSelector({
  invoiceItems = [],
  productBatches = {},
  returnType,
  onAddItem,
  isLoadingBatches = false,
  expiryClaimWindow = 90,
}) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Filter batches for selected product
  const availableBatches = productBatches[selectedProduct] || [];

  // Get the selected invoice item details
  const selectedInvoiceItem = invoiceItems.find((item) => item.productId === selectedProduct);

  // Get the selected batch details
  const selectedBatchDetails = availableBatches.find((b) => b.batchNumber === selectedBatch);

  // Max quantity based on batch
  const maxQuantity = selectedBatchDetails
    ? selectedBatchDetails.purchasedQuantity - (selectedBatchDetails.returnedQuantity || 0)
    : 0;

  // Check if expiry return is within allowed window
  const isExpiryWithinWindow = () => {
    if (returnType !== 'EXPIRY' || !selectedBatchDetails?.expiryDate) return true;
    const expiryDate = new Date(selectedBatchDetails.expiryDate);
    const now = new Date();
    const daysDiff = Math.ceil((now - expiryDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= expiryClaimWindow;
  };

  const validateAndAdd = () => {
    setError('');

    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    if (!selectedBatch) {
      setError('Please select a batch');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    if (Number(quantity) > maxQuantity) {
      setError(`Quantity cannot exceed ${maxQuantity} (available for this batch)`);
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    if (returnType === 'EXPIRY' && !isExpiryWithinWindow()) {
      setError(`Expiry claim window exceeded. Claims must be within ${expiryClaimWindow} days of expiry date.`);
      return;
    }

    onAddItem({
      productId: selectedProduct,
      productName: selectedInvoiceItem?.productName || '',
      batchNumber: selectedBatch,
      quantity: Number(quantity),
      maxQuantity,
      unitPrice: selectedBatchDetails?.unitPrice || selectedInvoiceItem?.unitPrice || 0,
      reason: reason.trim(),
      expiryDate: selectedBatchDetails?.expiryDate || null,
      companyName: selectedInvoiceItem?.companyName || '',
    });

    // Reset
    setSelectedProduct('');
    setSelectedBatch('');
    setQuantity('');
    setReason('');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Select Products & Batches <span className="text-red-500">*</span>
      </label>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
        {/* Product Select */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedBatch('');
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Select Product --</option>
            {invoiceItems.map((item) => (
              <option key={item.productId} value={item.productId}>
                {item.productName} ({item.companyName || ''}) — Batch: {item.batchNumber || 'N/A'}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Select */}
        {selectedProduct && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Batch Number</label>
            {isLoadingBatches ? (
              <div className="flex items-center gap-2 py-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Loading batches...
              </div>
            ) : (
              <>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setQuantity('');
                    setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Select Batch --</option>
                  {availableBatches.map((batch) => (
                    <option key={batch.batchNumber} value={batch.batchNumber}>
                      {batch.batchNumber} — Qty: {batch.purchasedQuantity - (batch.returnedQuantity || 0)} available
                      {batch.expiryDate ? ` — Exp: ${batch.expiryDate}` : ''}
                    </option>
                  ))}
                </select>

                {/* Manual batch entry fallback */}
                {availableBatches.length === 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-amber-600 mb-1">No batches found. Enter manually:</p>
                    <input
                      type="text"
                      placeholder="Enter batch number"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Quantity & Price info */}
        {selectedBatch && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Quantity (Max: {maxQuantity})
              </label>
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxQuantity);
                  setQuantity(val > 0 ? val : '');
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Max: ${maxQuantity}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>
              <input
                type="text"
                value={`₹${Number(selectedBatchDetails?.unitPrice || selectedInvoiceItem?.unitPrice || 0).toFixed(2)}`}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
          </div>
        )}

        {/* Expiry Warning */}
        {returnType === 'EXPIRY' && selectedBatchDetails?.expiryDate && !isExpiryWithinWindow() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            ⚠️ This batch expired more than {expiryClaimWindow} days ago. Credit note cannot be raised.
          </div>
        )}

        {/* Reason */}
        {selectedProduct && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={
                returnType === 'EXPIRY'
                  ? 'e.g., Product expired before use'
                  : returnType === 'BREAKAGE_DAMAGE'
                  ? 'e.g., Broken during transit'
                  : 'e.g., Ordered by mistake'
              }
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Button */}
        {selectedProduct && (
          <button
            type="button"
            onClick={validateAndAdd}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            + Add Product to Credit Note
          </button>
        )}
      </div>
    </div>
  );
}
