import React, { useState } from 'react';

export default function OfferCard({ offer, isSaved, onSave, viewMode }) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const daysRemaining = () => {
    const today = new Date('2026-03-18');
    const validUpto = new Date(offer.validUpto);
    const days = Math.ceil((validUpto - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getBadgeColor = () => {
    if (offer.badge === 'Flash Sale') return 'bg-red-100 text-red-800';
    if (offer.badge === 'Ending Soon') return 'bg-orange-100 text-orange-800';
    if (offer.badge === 'New') return 'bg-green-100 text-green-800';
    if (offer.badge === 'Popular') return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
  };

  const gridView = (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* Top Section - Discount */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-3xl font-bold">
              {offer.discount}{offer.discountType === 'percentage' ? '%' : '₹'}{' '}
              <span className="text-sm font-normal">off</span>
            </p>
          </div>
          <div className="text-3xl">{offer.image}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeColor()}`}>
            {offer.badge}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20">
            {daysRemaining()} days left
          </span>
        </div>

        {/* Save Button */}
        <button
          onClick={() => onSave(offer.id)}
          className={`absolute top-4 right-4 p-2 rounded-full transition ${
            isSaved ? 'bg-yellow-400 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save offer'}
        >
          <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
          </svg>
        </button>
      </div>

      {/* Title and Description */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{offer.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.description}</p>

        {/* Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-700">
          {offer.type === 'bulk' && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Min Qty:</span>
              <span>{offer.minQuantity} units</span>
            </div>
          )}
          {offer.applicableProducts.length <= 3 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">Products:</span>
              {offer.applicableProducts.map((prod, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                  {prod}
                </span>
              ))}
            </div>
          )}
          {offer.applicableProducts.length > 3 && (
            <div className="text-xs text-gray-600">
              +{offer.applicableProducts.length} products available
            </div>
          )}
        </div>

        {/* Validity */}
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
          <p className="font-medium mb-1">Valid:</p>
          <p>
            {formatDate(offer.validFrom)} to {formatDate(offer.validUpto)}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            View & Order
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          >
            Details
          </button>
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-3">Offer Details</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-600">Offer Type:</span>
              <span className="font-medium capitalize">{offer.type.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium capitalize">{offer.category.replace('-', ' ')}</span>
            </div>
            {offer.originalPrice && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-medium">₹{(offer.originalPrice / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Offer Price:</span>
                  <span className="font-medium text-green-600">₹{(offer.offerPrice / 1000).toFixed(1)}K</span>
                </div>
              </>
            )}
            {offer.savings && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">You Save:</span>
                <span className="font-bold text-green-600">₹{(offer.savings / 1000).toFixed(1)}K</span>
              </div>
            )}
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs">
              <p className="font-medium mb-1">📌 How to Avail:</p>
              <p>Add applicable products to cart and the discount will be applied automatically.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const listView = (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex gap-6">
      {/* Image */}
      <div className="text-6xl flex-shrink-0">{offer.image}</div>

      {/* Content */}
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>
            <p className="text-gray-600 mt-1">{offer.description}</p>
          </div>
          <button
            onClick={() => onSave(offer.id)}
            className={`p-2 rounded-full transition flex-shrink-0 ${
              isSaved ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600 text-xs font-medium">DISCOUNT</p>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {offer.discount}{offer.discountType === 'percentage' ? '%' : '₹'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-medium">VALID TILL</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(offer.validUpto)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-medium">DAYS LEFT</p>
            <p className="text-lg font-bold text-orange-600 mt-1">{daysRemaining()}d</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-medium">TYPE</p>
            <p className="text-lg font-bold text-purple-600 mt-1 capitalize">
              {offer.type.split('-')[0]}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeColor()}`}>
            {offer.badge}
          </span>
          {offer.applicableProducts.slice(0, 2).map((prod, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
              {prod}
            </span>
          ))}
          {offer.applicableProducts.length > 2 && (
            <span className="text-gray-600 text-xs px-2 py-1">
              +{offer.applicableProducts.length - 2} more
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            Order Now
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="col-span-full mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {offer.originalPrice && (
              <>
                <div>
                  <p className="text-gray-600 text-xs font-medium">Original Price</p>
                  <p className="font-semibold text-gray-900 mt-1">₹{(offer.originalPrice / 1000).toFixed(1)}K</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium">Offer Price</p>
                  <p className="font-semibold text-green-600 mt-1">₹{(offer.offerPrice / 1000).toFixed(1)}K</p>
                </div>
              </>
            )}
            {offer.savings && (
              <div>
                <p className="text-gray-600 text-xs font-medium">You Save</p>
                <p className="font-semibold text-blue-600 mt-1">₹{(offer.savings / 1000).toFixed(1)}K</p>
              </div>
            )}
            <div>
              <p className="text-gray-600 text-xs font-medium">Min Quantity</p>
              <p className="font-semibold text-gray-900 mt-1">{offer.minQuantity} units</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return viewMode === 'grid' ? gridView : listView;
}
