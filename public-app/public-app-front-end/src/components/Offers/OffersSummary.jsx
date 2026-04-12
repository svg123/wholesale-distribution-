import React from 'react';

export default function OffersSummary({ summary, savedCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Active Offers */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Active Offers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.activeOffers}</p>
            <p className="text-xs text-gray-600 mt-2">Out of {summary.totalOffers} total</p>
          </div>
          <div className="text-blue-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Savings */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Savings Available</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(summary.totalSavings / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-gray-600 mt-2">On bulk purchases</p>
          </div>
          <div className="text-green-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Average Discount */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Average Discount</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.averageDiscount}%</p>
            <p className="text-xs text-gray-600 mt-2">Across all offers</p>
          </div>
          <div className="text-orange-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Saved Offers */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">Saved Offers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{savedCount}</p>
            <p className="text-xs text-gray-600 mt-2">Bookmarked for you</p>
          </div>
          <div className="text-purple-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
