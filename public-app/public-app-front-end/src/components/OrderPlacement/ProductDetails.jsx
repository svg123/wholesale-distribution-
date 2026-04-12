import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearSelectedProduct, openSchemeModal, setError } from '../../redux/slices/orderPlacementSlice';
import { validateStock, calculateFreeQuantity } from '../../services/mockProductsData';

const ProductDetails = () => {
  const dispatch = useDispatch();
  const selectedProduct = useSelector((state) => state.orderPlacement.selectedProduct);
  const [quantity, setQuantity] = useState(1);
  const [calculatedFree, setCalculatedFree] = useState(0);
  const [stockWarning, setStockWarning] = useState(null);
  const quantityInputRef = useRef(null);

  // Auto-focus on quantity input when product is selected
  useEffect(() => {
    if (selectedProduct && quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, [selectedProduct]);

  // Calculate free quantity whenever quantity or product changes
  useEffect(() => {
    if (selectedProduct && selectedProduct.scheme) {
      const free = calculateFreeQuantity(quantity, selectedProduct.scheme);
      setCalculatedFree(free);
    } else {
      setCalculatedFree(0);
    }
  }, [quantity, selectedProduct]);

  // Validate stock on quantity change
  useEffect(() => {
    if (selectedProduct && quantity > 0) {
      const validation = validateStock(selectedProduct.productCode, quantity);
      if (!validation.valid) {
        setStockWarning(validation.message);
      } else {
        setStockWarning(null);
      }
    }
  }, [quantity, selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-dashed border-blue-200">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-600 mb-1">No Product Selected</p>
          <p className="text-sm text-gray-500">Search and select a product to view details</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      Ethical: 'bg-purple-100 text-purple-800 border-purple-200',
      Generic: 'bg-blue-100 text-blue-800 border-blue-200',
      OTC: 'bg-green-100 text-green-800 border-green-200',
      Standard: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStockStatus = (stock) => {
    if (stock > 1000) return { 
      color: 'text-green-600 bg-green-50', 
      icon: '✓', 
      text: 'In Stock',
      barColor: 'bg-green-500'
    };
    if (stock > 200) return { 
      color: 'text-yellow-600 bg-yellow-50', 
      icon: '⚠', 
      text: 'Low Stock',
      barColor: 'bg-yellow-500'
    };
    return { 
      color: 'text-red-600 bg-red-50', 
      icon: '⚠', 
      text: 'Critical Stock',
      barColor: 'bg-red-500'
    };
  };

  const stockStatus = getStockStatus(selectedProduct.stock);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty string (when user clears input or uses backspace)
    if (value === '') {
      setQuantity('');
      return;
    }
    // Parse and validate
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    }
  };

  const handleQuickQuantity = (value) => {
    setQuantity(value);
  };

  const handleAddToCart = () => {
    // Convert to number and validate
    const numQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    
    if (!numQuantity || numQuantity <= 0) {
      dispatch(setError('Quantity must be greater than 0'));
      setQuantity(1); // Reset to 1
      return;
    }

    const validation = validateStock(selectedProduct.productCode, numQuantity);
    if (!validation.valid && numQuantity > selectedProduct.stock) {
      const proceed = window.confirm(
        `${validation.message}. Do you want to add available stock (${selectedProduct.stock} units)?`
      );
      if (proceed) {
        dispatch(addToCart({ product: selectedProduct, quantity: selectedProduct.stock }));
        dispatch(clearSelectedProduct());
        setQuantity(1);
        setStockWarning(null);
      }
      return;
    }

    dispatch(addToCart({ product: selectedProduct, quantity: numQuantity }));
    dispatch(clearSelectedProduct());
    setQuantity(1);
    setStockWarning(null);
  };

  const handleCancel = () => {
    dispatch(clearSelectedProduct());
    setQuantity(1);
    setStockWarning(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddToCart();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Handle empty or string quantity for calculations
  const numQuantity = typeof quantity === 'string' && quantity === '' ? 0 : (typeof quantity === 'string' ? parseInt(quantity) : quantity);
  const baseTotal = numQuantity * selectedProduct.pricePerUnit;
  const gstAmount = (baseTotal * selectedProduct.gst) / 100;
  const totalPrice = baseTotal + gstAmount;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Product Details
          </h3>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-200 transition-colors"
            title="Clear Selection"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Product Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</label>
            <p className="text-base font-semibold text-gray-900 mt-1">{selectedProduct.productName}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product Code</label>
            <p className="text-base font-mono font-semibold text-blue-600 mt-1">{selectedProduct.productCode}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</label>
            <p className="text-base font-medium text-gray-900 mt-1">{selectedProduct.companyName}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</label>
            <div className="mt-1">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(selectedProduct.category)}`}>
                {selectedProduct.category}
              </span>
            </div>
          </div>
        </div>

        {/* Stock & Price Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border-2 ${stockStatus.color.replace('text-', 'border-').split(' ')[0]}`}>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Stock</label>
            <p className={`text-2xl font-bold mt-1 ${stockStatus.color.split(' ')[0]}`}>
              {selectedProduct.stock}
            </p>
            <p className="text-xs font-medium mt-1">{stockStatus.text}</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Price/Unit</label>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{selectedProduct.pricePerUnit.toFixed(2)}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">GST</label>
            <p className="text-2xl font-bold text-green-600 mt-1">{selectedProduct.gst}%</p>
          </div>
        </div>

        {/* Scheme Display */}
        {selectedProduct.scheme && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 text-white p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Special Scheme Available</p>
                  <p className="text-lg font-bold text-orange-800">
                    Buy {selectedProduct.scheme.buy}, Get {selectedProduct.scheme.free} FREE
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(openSchemeModal(selectedProduct.scheme))}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 
                         transition-colors font-medium text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        )}

        {/* Quantity Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Quantity
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                ref={quantityInputRef}
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg 
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            
            {/* Quick Quantity Buttons */}
            <div className="flex gap-2">
              {[5, 10, 20, 50].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickQuantity(value)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg 
                           font-medium transition-colors border border-gray-300"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Warning */}
          {stockWarning && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-red-700">{stockWarning}</p>
            </div>
          )}
        </div>

        {/* Calculation Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="text-lg font-bold text-gray-900">{numQuantity || 0} units</p>
            </div>
            {selectedProduct.scheme && (
              <div className="bg-green-100 -m-4 p-4 rounded-r-lg border-l-4 border-green-500">
                <p className="text-sm text-green-700">Free Quantity</p>
                <p className="text-lg font-bold text-green-800">{calculatedFree} units</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Amount:</span>
              <span className="font-semibold text-gray-900">₹{baseTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST ({selectedProduct.gst}%):</span>
              <span className="font-semibold text-gray-900">₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-gray-300">
              <span className="font-semibold text-gray-900">Total Amount:</span>
              <span className="font-bold text-blue-600 text-xl">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     font-semibold transition-colors flex items-center justify-center gap-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Order
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg 
                     font-semibold transition-colors focus:outline-none focus:ring-2 
                     focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> to add to cart or{' '}
          <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
