import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItemQuantity, removeFromCart, openSchemeModal } from '../../redux/slices/orderPlacementSlice';

const CartTable = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.orderPlacement.cart);
  const [editingRow, setEditingRow] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (productCode, currentQuantity) => {
    setEditingRow(productCode);
    setEditValue(currentQuantity.toString());
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditValue('');
  };

  const handleEditSave = (productCode) => {
    const newQuantity = parseInt(editValue) || 1;
    if (newQuantity > 0) {
      dispatch(updateCartItemQuantity({ productCode, quantity: newQuantity }));
    }
    setEditingRow(null);
    setEditValue('');
  };

  const handleKeyPress = (e, productCode) => {
    if (e.key === 'Enter') {
      handleEditSave(productCode);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleRemove = (productCode, productName) => {
    if (window.confirm(`Remove "${productName}" from order?`)) {
      dispatch(removeFromCart(productCode));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Ethical: 'bg-purple-100 text-purple-800 border-purple-200',
      Generic: 'bg-blue-100 text-blue-800 border-blue-200',
      OTC: 'bg-green-100 text-green-800 border-green-200',
      Standard: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (cart.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-12 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Your Order Cart is Empty</h3>
          <p className="text-gray-500">Search and add products to start creating your order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Order Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Free Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price/Unit
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                GST
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cart.map((item, index) => (
              <tr
                key={item.productCode}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {/* Product */}
                <td className="px-4 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500 font-mono">{item.productCode}</p>
                  </div>
                </td>

                {/* Company */}
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-700">{item.companyName}</p>
                </td>

                {/* Category */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </td>

                {/* Quantity */}
                <td className="px-4 py-4">
                  {editingRow === item.productCode ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, item.productCode)}
                        className="w-20 px-2 py-1 text-center border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(item.productCode)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Save"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Cancel"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleEditStart(item.productCode, item.quantity)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Quantity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>

                {/* Free Quantity */}
                <td className="px-4 py-4">
                  <div className="flex flex-col items-center">
                    {item.freeQuantity > 0 ? (
                      <>
                        <span className="text-lg font-bold text-green-600">{item.freeQuantity}</span>
                        {item.scheme && (
                          <button
                            onClick={() => dispatch(openSchemeModal(item.scheme))}
                            className="text-xs text-orange-600 hover:text-orange-700 underline mt-1"
                            title="View Scheme Details"
                          >
                            {item.scheme.buy}+{item.scheme.free}
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>

                {/* Price per Unit */}
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-gray-900">₹{item.pricePerUnit.toFixed(2)}</span>
                </td>

                {/* GST */}
                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-medium text-gray-700">{item.gst}%</span>
                </td>

                {/* Total */}
                <td className="px-4 py-4 text-right">
                  <span className="text-lg font-bold text-blue-600">₹{item.totalPrice.toFixed(2)}</span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleRemove(item.productCode, item.productName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from cart"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Responsive Cards) */}
      <div className="lg:hidden divide-y divide-gray-200">
        {cart.map((item) => (
          <div key={item.productCode} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500 font-mono">{item.productCode}</p>
                <p className="text-sm text-gray-600 mt-1">{item.companyName}</p>
              </div>
              <button
                onClick={() => handleRemove(item.productCode, item.productName)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Quantity:</span>
                <span className="ml-2 font-bold text-gray-900">{item.quantity}</span>
                <button
                  onClick={() => handleEditStart(item.productCode, item.quantity)}
                  className="ml-1 p-0.5 text-blue-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              <div>
                <span className="text-gray-600">Free:</span>
                <span className="ml-2 font-bold text-green-600">{item.freeQuantity || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">GST:</span>
                <span className="ml-2 font-medium">{item.gst}%</span>
              </div>
              <div>
                <span className="text-gray-600">Price/Unit:</span>
                <span className="ml-2 font-semibold">₹{item.pricePerUnit.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-bold text-blue-600">₹{item.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartTable;
