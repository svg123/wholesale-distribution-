import React from 'react';

export default function OffersHeader({ onBackClick }) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container-custom py-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎉 Special Offers & Promotions</h1>
            <p className="text-blue-100 text-lg">
              Discover amazing deals on pharmaceutical products & save on your orders
            </p>
          </div>
          <button
            onClick={onBackClick}
            className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Active Offers</p>
            <p className="text-2xl font-bold text-white mt-1">8</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Total Savings Available</p>
            <p className="text-2xl font-bold text-white mt-1">₹13.6L</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-blue-100 text-sm">Avg Discount</p>
            <p className="text-2xl font-bold text-white mt-1">20%</p>
          </div>
        </div>
      </div>
    </header>
  );
}
