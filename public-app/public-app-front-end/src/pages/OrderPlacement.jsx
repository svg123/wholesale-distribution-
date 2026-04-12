import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SearchBar from '../components/OrderPlacement/SearchBar';
import ProductDetails from '../components/OrderPlacement/ProductDetails';
import CartTable from '../components/OrderPlacement/CartTable';
import SummaryPanel from '../components/OrderPlacement/SummaryPanel';
import SchemeModal from '../components/OrderPlacement/SchemeModal';

const OrderPlacement = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const selectedProduct = useSelector((state) => state.orderPlacement.selectedProduct);
  const cart = useSelector((state) => state.orderPlacement.cart);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  New Order Placement
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Search products, add to cart, and place your medical wholesale order
                </p>
              </div>
            </div>

            {/* Quick Stats Badge */}
            {cart.length > 0 && (
              <div className="hidden md:flex items-center gap-4">
                <div className="bg-blue-100 px-4 py-2 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 font-medium">Items in Cart</p>
                  <p className="text-2xl font-bold text-blue-600">{cart.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search and Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Search Products</h2>
                  <p className="text-sm text-gray-600">Start by searching for products to add to your order</p>
                </div>
              </div>
              <SearchBar />
            </div>

            {/* Product Details Section */}
            {selectedProduct && (
              <div className="animate-fadeIn">
                <ProductDetails />
              </div>
            )}

            {/* Instructions Card (shown when no product selected) */}
            {!selectedProduct && cart.length === 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-dashed border-blue-200">
                <div className="text-center mb-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">How to Place an Order</h3>
                  <p className="text-gray-600 mb-6">Follow these simple steps to create your order</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                      1
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Search Products</h4>
                    <p className="text-sm text-gray-600">
                      Use the search bar to find products by name or code
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                      2
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Add to Cart</h4>
                    <p className="text-sm text-gray-600">
                      Select quantity and add items to your order cart
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                      3
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Place Order</h4>
                    <p className="text-sm text-gray-600">
                      Review your cart and confirm your order
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-yellow-800 mb-1">Pro Tips:</p>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Look for products with special schemes to get free units</li>
                        <li>Check stock availability before adding large quantities</li>
                        <li>Use keyboard shortcuts (↑↓ Enter) for faster navigation</li>
                        <li>All prices shown include GST</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Order Cart</h2>
                  <p className="text-sm text-gray-600">Review and manage items in your cart</p>
                </div>
              </div>
              <CartTable />
            </div>
          </div>

          {/* Right Column - Summary Panel */}
          <div className="lg:col-span-1">
            <SummaryPanel />
          </div>
        </div>
      </div>

      {/* Scheme Modal */}
      <SchemeModal />

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OrderPlacement;
